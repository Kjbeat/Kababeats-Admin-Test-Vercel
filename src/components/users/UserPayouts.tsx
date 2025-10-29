/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { 
  DollarSign,
  Users,
  LineChart,
  FileClock,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface UserPayoutsProps {
  user: any;
  stats: any;
  sales: any[];
  collaborationRequests: any[];
  allBeats: any[];
  payouts: any[]; 
  onRefresh: () => void;
  isLoading: boolean;
}

export function UserPayouts({ user, stats, sales, collaborationRequests, allBeats, payouts }: UserPayoutsProps) {
    console.log('Collaboration requests:', collaborationRequests); // 👈 AJOUTE CETTE LIGNE
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const payoutData = useMemo(() => {
  const userId = user._id;

  let soloSalesEarnings = 0;
  let collaborationEarnings = 0;
  const collaborationSales: any[] = [];

  // 🔍 Parcourir TOUTES les ventes pour classer solo vs collab
  for (const sale of sales) {
    // Vérifier si la vente est une collaboration (earningsSplits existe et contient l'utilisateur)
    if (sale.earningsSplits && Array.isArray(sale.earningsSplits)) {
      const userSplit = sale.earningsSplits.find((split: any) =>
        split.userId?._id?.toString() === userId.toString() ||
        split.userId?.toString() === userId.toString()
      );

      if (userSplit) {
        collaborationEarnings += userSplit.amount || 0;
        collaborationSales.push({
          _id: sale._id,
          beatTitle: sale.beatId?.title || 'Collaboration Sale',
          yourEarnings: userSplit.amount || 0,
          saleDate: sale.createdAt,
          buyerName: sale.buyerId?.username || 'Unknown Buyer',
          licenseType: sale.licenseName || 'N/A',
        });
        continue; // Passer à la vente suivante
      }
    }

    // Si on arrive ici → vente solo OU vente où l'utilisateur n'est pas impliqué
    // Mais on ne veut QUE les ventes où l'utilisateur est le vendeur (solo)
    if (
      (sale.sellerId?._id?.toString() === userId.toString() ||
       sale.sellerId?.toString() === userId.toString()) &&
      (!sale.earningsSplits || sale.earningsSplits.length === 0)
    ) {
      /* soloSalesEarnings += sale.sellerProfit || sale.amount || 0; */
      soloSalesEarnings += typeof sale.sellerProfit === 'number' ? sale.sellerProfit : 0;
    }
  }

  const totalEarnings = soloSalesEarnings + collaborationEarnings;

  // Enrichir les demandes de collaboration (inchangé)
 // 🔍 LOG DE DÉBOGAGE : Voir les données reçues
console.log('Collaboration requests received:', collaborationRequests);

const enrichedRequests = collaborationRequests.map(req => {
  console.log('Processing collaboration request:', {
    id: req._id,
    beatId: req.beatId,
    invitedBy: req.invitedBy,
    invitedEmail: req.invitedEmail,
  });

  // ✅ Utiliser directement le beat populaire depuis le backend
  const beatTitle = req.beatId?.title || 'Unknown Beat';

  // ✅ Utiliser directement l'émetteur populaire (invitedBy)
  let otherUser = 'Unknown';
  if (req.invitedBy && typeof req.invitedBy === 'object') {
    otherUser = req.invitedBy.username || req.invitedBy.email || 'Unknown';
  } else if (req.invitedEmail) {
    // Fallback : si invitedBy n'est pas populaire, utilise l'email (cas rare)
    otherUser = req.invitedEmail;
  }

  return {
    ...req,
    beatTitle,     // ✅ Titre réel du beat
    otherUser,     // ✅ Nom/email de l'émetteur (ex: "gexoja89596005")
  };
});

  return {
    balance: {
      total: totalEarnings,
      available: totalEarnings, 
      pending: totalEarnings ,
      breakdown: {
        soloSales: soloSalesEarnings,
        collaborationSales: collaborationEarnings,
      }
    },
    collaborationSales,
    collaborationRequests: enrichedRequests,
    payoutMethods: [],
    payoutHistory: [],
  };
}, [sales, user._id, collaborationRequests, allBeats]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      accepted: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent" />
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10"><DollarSign className="h-5 w-5 text-emerald-600" /></span>
              Payout Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-semibold tracking-tight text-emerald-600">{formatCurrency(payoutData.balance.available)}</h3>
                <p className="text-sm text-muted-foreground">Available for withdrawal</p>
              </div>
              <div className="text-left md:text-right">
                <div className="text-lg font-semibold text-emerald-600">{formatCurrency(payoutData.balance.total)}</div>
                <div className="text-xs text-muted-foreground">Total earnings</div>
              </div>
            </div>
            <div className="mt-6 border-t border-emerald-200 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-white/50 p-4">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium text-emerald-800">Solo Sales</p><p className="text-xs text-emerald-600">Individual beats</p></div>
                    <p className="text-lg font-semibold text-emerald-700">{formatCurrency(payoutData.balance.breakdown.soloSales)}</p>
                  </div>
                </div>
                <div className="rounded-lg border bg-white/50 p-4">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium text-emerald-800">Collaboration Sales</p><p className="text-xs text-emerald-600">Shared beats</p></div>
                    <p className="text-lg font-semibold text-emerald-700">{formatCurrency(payoutData.balance.breakdown.collaborationSales)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Collaboration Requests</TabsTrigger>
          <TabsTrigger value="collaborations">Collaboration Sales</TabsTrigger>
          <TabsTrigger value="history">Payout History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Payout Methods</CardTitle></CardHeader>
            <CardContent className="text-center py-8 text-muted-foreground"><p>No payout methods configured.</p></CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Demandes de Collaboration - CORRIGÉ */}
        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Collaboration Requests</CardTitle></CardHeader>
            <CardContent>
              {payoutData.collaborationRequests.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Beat</TableHead><TableHead>From</TableHead><TableHead>Share</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead>{/* <TableHead>Actions</TableHead> */}</TableRow></TableHeader>
                  <TableBody>
                    {payoutData.collaborationRequests.map((request) => (
                      <TableRow key={request._id}>
                       <TableCell className="font-medium">{request.beatTitle}</TableCell>
                        <TableCell>{request.otherUser}</TableCell>
                        <TableCell>{request.percent}%</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {new Date(request.invitedAt?.$date || request.invitedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground"><Users className="mx-auto h-12 w-12 mb-4" /><p className="font-semibold">No Collaboration Requests</p></div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaborations" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Collaboration Sales</CardTitle></CardHeader>
            <CardContent>
              {payoutData.collaborationSales.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Beat</TableHead><TableHead>License</TableHead><TableHead>Buyer</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Your Earnings</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {payoutData.collaborationSales.map((sale) => (
                      <TableRow key={sale._id}>
                        <TableCell className="font-medium">{sale.beatTitle}</TableCell>
                        <TableCell><Badge variant="secondary">{sale.licenseType}</Badge></TableCell>
                        <TableCell>{sale.buyerName}</TableCell>
                        <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">+{formatCurrency(sale.yourEarnings)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground"><LineChart className="mx-auto h-12 w-12 mb-4" /><p className="font-semibold">No Collaboration Sales</p></div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Payout History</CardTitle></CardHeader>
            <CardContent>
              {payouts && payouts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Solo</TableHead>
                      <TableHead>Collab</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout._id?.$oid || payout._id}>
                        <TableCell className="font-medium">
                          {payout.month}/{payout.year}
                        </TableCell>
                        <TableCell>{formatCurrency(payout.soloAmount)}</TableCell>
                        <TableCell>{formatCurrency(payout.collabAmount)}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payout.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            payout.status === 'paid' ? 'default' :
                            payout.status === 'pending' ? 'secondary' :
                            payout.status === 'processing' ? 'outline' : 'destructive'
                          }>
                            {payout.status?.charAt(0).toUpperCase() + payout.status?.slice(1) || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(payout.createdAt?.$date || payout.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileClock className="mx-auto h-12 w-12 mb-4" />
                  <p className="font-semibold">No Payout History</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}