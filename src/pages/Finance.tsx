import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { Transaction, Investment, FinanceSummary, InvestmentSummary } from '@/types';

const EXPENSE_CATEGORIES = [
  'Alimentacao', 'Transporte', 'Moradia', 'Saude', 'Educacao',
  'Lazer', 'Compras', 'Servicos', 'Outros',
];
const INCOME_CATEGORIES = ['Salario', 'Freelance', 'Investimentos', 'Outros'];
const INVESTMENT_TYPES = [
  { value: 'stock', label: 'Acoes' },
  { value: 'crypto', label: 'Cripto' },
  { value: 'fixed_income', label: 'Renda Fixa' },
  { value: 'fund', label: 'Fundos' },
  { value: 'real_estate', label: 'Imoveis' },
  { value: 'other', label: 'Outros' },
];

const PIE_COLORS = ['#FABE00', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4', '#6b7280'];

export function Finance() {
  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [investSummary, setInvestSummary] = useState<InvestmentSummary | null>(null);
  const [showTxForm, setShowTxForm] = useState(false);
  const [showInvForm, setShowInvForm] = useState(false);
  const [newTx, setNewTx] = useState({
    description: '', amount: '', type: 'expense', category: 'Alimentacao', date: new Date().toISOString().split('T')[0],
  });
  const [newInv, setNewInv] = useState({
    name: '', type: 'stock', amountInvested: '', currentValue: '', purchaseDate: new Date().toISOString().split('T')[0],
  });

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

  const loadData = useCallback(() => {
    api.get<Transaction[]>(`/api/finance/transactions?startDate=${startDate}&endDate=${endDate}`).then(setTransactions).catch(console.error);
    api.get<Investment[]>('/api/finance/investments').then(setInvestments).catch(console.error);
    api.get<FinanceSummary>(`/api/finance/summary?month=${month}&year=${year}`).then(setSummary).catch(console.error);
    api.get<InvestmentSummary>('/api/finance/investments/summary').then(setInvestSummary).catch(console.error);
  }, [startDate, endDate, month, year]);

  useEffect(() => { loadData(); }, [loadData]);

  const createTransaction = () => {
    if (!newTx.description || !newTx.amount) return;
    api.post('/api/finance/transactions', {
      ...newTx,
      amount: parseFloat(newTx.amount),
    }).then(() => {
      setNewTx({ description: '', amount: '', type: 'expense', category: 'Alimentacao', date: new Date().toISOString().split('T')[0] });
      setShowTxForm(false);
      loadData();
    }).catch(console.error);
  };

  const createInvestment = () => {
    if (!newInv.name || !newInv.amountInvested) return;
    api.post('/api/finance/investments', {
      ...newInv,
      amountInvested: parseFloat(newInv.amountInvested),
      currentValue: parseFloat(newInv.currentValue || newInv.amountInvested),
    }).then(() => {
      setNewInv({ name: '', type: 'stock', amountInvested: '', currentValue: '', purchaseDate: new Date().toISOString().split('T')[0] });
      setShowInvForm(false);
      loadData();
    }).catch(console.error);
  };

  const deleteTx = (id: number) => {
    api.del(`/api/finance/transactions/${id}`).then(loadData).catch(console.error);
  };

  const deleteInv = (id: number) => {
    api.del(`/api/finance/investments/${id}`).then(loadData).catch(console.error);
  };

  const getInvTypeLabel = (type: string) => INVESTMENT_TYPES.find(t => t.value === type)?.label ?? type;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Financeiro</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Controle de gastos, investimentos e metas</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Receitas</p>
                <p className="text-base sm:text-xl font-bold text-green-400">{formatCurrency(summary?.totalIncome ?? 0)}</p>
              </div>
              <ArrowUpRight className="text-green-400" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Despesas</p>
                <p className="text-base sm:text-xl font-bold text-red-400">{formatCurrency(summary?.totalExpense ?? 0)}</p>
              </div>
              <ArrowDownRight className="text-red-400" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Saldo</p>
                <p className={`text-base sm:text-xl font-bold ${(summary?.balance ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(summary?.balance ?? 0)}
                </p>
              </div>
              <DollarSign className="text-yellow-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Patrimonio</p>
                <p className="text-base sm:text-xl font-bold text-yellow-500">{formatCurrency(investSummary?.totalCurrentValue ?? 0)}</p>
              </div>
              <TrendingUp className="text-yellow-500" size={20} />
            </div>
            {investSummary && investSummary.profitPercentage !== 0 && (
              <p className={`text-xs mt-1 ${investSummary.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {investSummary.profit >= 0 ? '+' : ''}{investSummary.profitPercentage.toFixed(1)}% rendimento
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }} className="border">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-yellow-500/10 data-[state=active]:text-yellow-500">
            Transacoes
          </TabsTrigger>
          <TabsTrigger value="investments" className="data-[state=active]:bg-yellow-500/10 data-[state=active]:text-yellow-500">
            Investimentos
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-yellow-500/10 data-[state=active]:text-yellow-500">
            Relatorios
          </TabsTrigger>
        </TabsList>

        {/* TRANSACTIONS TAB */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowTxForm(!showTxForm)} className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium">
              <Plus size={18} className="mr-1" /> Nova Transacao
            </Button>
          </div>

          {showTxForm && (
            <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <Input
                    value={newTx.description}
                    onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                    placeholder="Descricao..."
                    className="md:col-span-2"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                  />
                  <Input
                    type="number"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    placeholder="Valor"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                  />
                  <select
                    value={newTx.type}
                    onChange={(e) => setNewTx({ ...newTx, type: e.target.value, category: e.target.value === 'income' ? 'Salario' : 'Alimentacao' })}
                    className="px-3 py-2 rounded-lg border text-sm"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                  >
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </select>
                  <select
                    value={newTx.category}
                    onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                    className="px-3 py-2 rounded-lg border text-sm"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                  >
                    {(newTx.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <Button onClick={createTransaction} className="bg-yellow-500 hover:bg-yellow-400 text-black">
                    Criar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction list */}
          <div className="space-y-2">
            {transactions.map((tx) => (
              <Card key={tx.id} className="group" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                    {tx.type === 'income' ? <TrendingUp size={14} className="text-green-400" /> : <TrendingDown size={14} className="text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs" style={{ borderColor: 'var(--border-secondary)', color: 'var(--text-muted)' }}>{tx.category}</Badge>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  <button
                    onClick={() => deleteTx(tx.id)}
                    className="p-1 rounded hover:text-red-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </CardContent>
              </Card>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                <DollarSign size={40} className="mx-auto mb-2 opacity-50" />
                <p>Nenhuma transacao neste mes</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* INVESTMENTS TAB */}
        <TabsContent value="investments" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowInvForm(!showInvForm)} className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium">
              <Plus size={18} className="mr-1" /> Novo Investimento
            </Button>
          </div>

          {showInvForm && (
            <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <Input
                    value={newInv.name}
                    onChange={(e) => setNewInv({ ...newInv, name: e.target.value })}
                    placeholder="Nome do investimento..."
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                  />
                  <select
                    value={newInv.type}
                    onChange={(e) => setNewInv({ ...newInv, type: e.target.value })}
                    className="px-3 py-2 rounded-lg border text-sm"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                  >
                    {INVESTMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    value={newInv.amountInvested}
                    onChange={(e) => setNewInv({ ...newInv, amountInvested: e.target.value })}
                    placeholder="Valor investido"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                  />
                  <Input
                    type="number"
                    value={newInv.currentValue}
                    onChange={(e) => setNewInv({ ...newInv, currentValue: e.target.value })}
                    placeholder="Valor atual"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                  />
                  <Button onClick={createInvestment} className="bg-yellow-500 hover:bg-yellow-400 text-black">
                    Criar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Investment list */}
          <div className="space-y-2">
            {investments.map((inv) => {
              const profit = inv.currentValue - inv.amountInvested;
              const profitPct = inv.amountInvested > 0 ? (profit / inv.amountInvested) * 100 : 0;
              return (
                <Card key={inv.id} className="group" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp size={18} className="text-yellow-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{inv.name}</p>
                      <Badge variant="outline" className="text-xs mt-1" style={{ borderColor: 'var(--border-secondary)', color: 'var(--text-muted)' }}>
                        {getInvTypeLabel(inv.type)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(inv.currentValue)}</p>
                      <p className={`text-xs ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {profit >= 0 ? '+' : ''}{formatCurrency(profit)} ({profitPct.toFixed(1)}%)
                      </p>
                    </div>
                    <button
                      onClick={() => deleteInv(inv.id)}
                      className="p-1 rounded hover:text-red-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
            {investments.length === 0 && (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                <PieChart size={40} className="mx-auto mb-2 opacity-50" />
                <p>Nenhum investimento registrado</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* REPORTS TAB */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expenses by category */}
            <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <CardHeader>
                <CardTitle className="text-base" style={{ color: 'var(--text-primary)' }}>Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {summary && summary.expensesByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie
                        data={summary.expensesByCategory}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {summary.expensesByCategory.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Sem dados para exibir
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investment allocation */}
            <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <CardHeader>
                <CardTitle className="text-base" style={{ color: 'var(--text-primary)' }}>Alocacao de Investimentos</CardTitle>
              </CardHeader>
              <CardContent>
                {investSummary && investSummary.allocation.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie
                        data={investSummary.allocation.map(a => ({ ...a, type: getInvTypeLabel(a.type) }))}
                        dataKey="value"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {investSummary.allocation.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Sem dados para exibir
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Income vs Expenses bar chart */}
            <Card className="md:col-span-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
              <CardHeader>
                <CardTitle className="text-base" style={{ color: 'var(--text-primary)' }}>Receitas vs Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                {summary ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { name: 'Receitas', valor: summary.totalIncome },
                      { name: 'Despesas', valor: summary.totalExpense },
                      { name: 'Saldo', valor: summary.balance },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="name" stroke="#737373" fontSize={12} />
                      <YAxis stroke="#737373" fontSize={12} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                        <Cell fill="#FABE00" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Sem dados para exibir
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
