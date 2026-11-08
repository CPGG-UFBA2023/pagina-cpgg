import { resolveAdminSession } from '@/hooks/useAccessPermissions'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LaigaEquipmentUpload } from '@/components/LaigaEquipmentUpload';
import styles from './equipamentos.module.css';
import logoUfba from '/src/components/Figures/LogoUfba.png';
import { Trash2, Search, LogOut, ArrowLeft, Edit, Save, X } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  description?: string;
  model?: string;
  brand?: string;
  serial_number?: string;
  status: string;
  location?: string;
  responsible_person?: string;
  acquisition_date?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  observations?: string;
  created_at: string;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export function EquipamentosLaiga() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Equipment>>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    void resolveAdminSession('equipment').then(user => {
      if (!user) return;
      setAdminUser(user);
      fetchEquipments();
    });
  }, []);

  useEffect(() => {
    filterEquipments();
  }, [equipments, searchTerm, statusFilter]);

  useEffect(() => {
    // Limpar seleções quando os filtros mudarem
    setSelectedItems([]);
  }, [searchTerm, statusFilter]);

  const fetchEquipments = async () => {
    try {
      const { data, error } = await supabase
        .from('laiga_equipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEquipments(data || []);
    } catch (error) {
      console.error('Error fetching equipments:', error);
      toast({
        title: 'Erro ao carregar equipamentos',
        description: 'Não foi possível carregar a lista de equipamentos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEquipments = () => {
    let filtered = equipments;

    if (searchTerm) {
      filtered = filtered.filter(equipment =>
        equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(equipment => equipment.status === statusFilter);
    }

    setFilteredEquipments(filtered);
  };

  const deleteEquipment = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este equipamento?')) return;

    try {
      const { error } = await supabase
        .from('laiga_equipments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchEquipments();
      toast({
        title: 'Equipamento excluído',
        description: 'O equipamento foi removido com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o equipamento.',
        variant: 'destructive',
      });
    }
  };

  const startEditing = (equipment: Equipment) => {
    setEditingId(equipment.id);
    setEditingData({ ...equipment });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData({});
  };

  const saveEditing = async () => {
    if (!editingId || !editingData) return;

    try {
      const { error } = await supabase
        .from('laiga_equipments')
        .update(editingData)
        .eq('id', editingId);

      if (error) throw error;

      await fetchEquipments();
      setEditingId(null);
      setEditingData({});
      
      toast({
        title: 'Equipamento atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    }
  };

  const handleEditChange = (field: keyof Equipment, value: string) => {
    setEditingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredEquipments.map(eq => eq.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: 'Nenhum item selecionado',
        description: 'Selecione pelo menos um equipamento para excluir.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir ${selectedItems.length} equipamento(s) selecionado(s)?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('laiga_equipments')
        .delete()
        .in('id', selectedItems);

      if (error) throw error;

      await fetchEquipments();
      setSelectedItems([]);
      
      toast({
        title: 'Equipamentos excluídos',
        description: `${selectedItems.length} equipamento(s) foram removidos com sucesso.`,
      });
    } catch (error) {
      console.error('Error deleting selected equipment:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir os equipamentos selecionados.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    window.location.href = '/coordenacao';
  };

  const handleBackToDashboard = () => {
    window.location.href = '/adm/coordenacao/dashboard';
  };

  const migrateToReservations = async () => {
    if (filteredEquipments.length === 0) {
      toast({
        title: 'Nenhum equipamento para migrar',
        description: 'Não há equipamentos disponíveis para migração.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Tem certeza que deseja migrar ${filteredEquipments.length} equipamento(s) para o banco de dados de reservas? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      // Converter equipamentos para formato de reservas
      const reservationsData = filteredEquipments.map(equipment => ({
        nome: equipment.name || 'Equipamento',
        sobrenome: 'LAIGA',
        email: equipment.responsible_person || 'laiga@ufba.br',
        uso: equipment.description || 'Uso de equipamento',
        tipo_reserva: 'laiga_equipments',
        inicio: equipment.acquisition_date 
          ? new Date(equipment.acquisition_date).toISOString()
          : new Date().toISOString(),
        termino: equipment.next_maintenance 
          ? new Date(equipment.next_maintenance).toISOString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +1 dia se não tiver data
        status: equipment.status === 'available' ? 'aprovada' : 
                equipment.status === 'maintenance' ? 'rejeitada' : 'pendente'
      }));

      // Inserir nas reservas
      const { error: insertError } = await supabase
        .from('reservations')
        .insert(reservationsData);

      if (insertError) throw insertError;

      // Deletar equipamentos originais após migração bem-sucedida
      const equipmentIds = filteredEquipments.map(eq => eq.id);
      const { error: deleteError } = await supabase
        .from('laiga_equipments')
        .delete()
        .in('id', equipmentIds);

      if (deleteError) throw deleteError;

      // Atualizar lista local
      await fetchEquipments();

      toast({
        title: 'Migração concluída',
        description: `${reservationsData.length} equipamento(s) foram migrados para o banco de dados de reservas.`,
      });

    } catch (error) {
      console.error('Error migrating equipment:', error);
      toast({
        title: 'Erro na migração',
        description: 'Não foi possível migrar os equipamentos. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'in_use':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      case 'unavailable':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'in_use':
        return 'Em Uso';
      case 'maintenance':
        return 'Manutenção';
      case 'unavailable':
        return 'Indisponível';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando equipamentos...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <img src={logoUfba} alt="UFBA Logo" />
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleBackToDashboard} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel
          </Button>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      <h1 className={styles.title}>Gerenciar Equipamentos LAIGA</h1>

      <div className={styles.content}>
        <div className="mb-6">
          <LaigaEquipmentUpload />
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lista de Equipamentos</CardTitle>
              <div className="flex gap-2">
                {selectedItems.length > 0 && (
                  <Button 
                    onClick={deleteSelectedItems}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Selecionados ({selectedItems.length})
                  </Button>
                )}
                <Button 
                  onClick={migrateToReservations}
                  variant="default"
                  disabled={filteredEquipments.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Agregar ao banco de dados geral
                </Button>
              </div>
            </div>
            <div className={styles.filters}>
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, marca, modelo ou série..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={styles.select}
                >
                  <option value="all">Todos os Status</option>
                  <option value="available">Disponível</option>
                  <option value="in_use">Em Uso</option>
                  <option value="maintenance">Manutenção</option>
                  <option value="unavailable">Indisponível</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={styles.tableContainer}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedItems.length === filteredEquipments.length && filteredEquipments.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Selecionar todos"
                      />
                    </TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Laboratório/Espaço</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Término</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Solicitação</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipments.map((equipment) => (
                    <TableRow key={equipment.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(equipment.id)}
                          onCheckedChange={(checked) => handleSelectItem(equipment.id, checked as boolean)}
                          aria-label={`Selecionar ${equipment.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {editingId === equipment.id ? (
                          <Input
                            value={editingData.name || ''}
                            onChange={(e) => handleEditChange('name', e.target.value)}
                            placeholder="Nome do equipamento"
                          />
                        ) : (
                          equipment.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === equipment.id ? (
                          <Input
                            value={editingData.responsible_person || ''}
                            onChange={(e) => handleEditChange('responsible_person', e.target.value)}
                            placeholder="Responsável"
                          />
                        ) : (
                          equipment.responsible_person || '-'
                        )}
                      </TableCell>
                      <TableCell>
                        LAIGA
                      </TableCell>
                      <TableCell>
                        {editingId === equipment.id ? (
                          <Input
                            value={editingData.description || ''}
                            onChange={(e) => handleEditChange('description', e.target.value)}
                            placeholder="Descrição/Uso"
                          />
                        ) : (
                          equipment.description || '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === equipment.id ? (
                          <Input
                            type="datetime-local"
                            value={editingData.acquisition_date 
                              ? new Date(editingData.acquisition_date).toISOString().slice(0, 16)
                              : ''
                            }
                            onChange={(e) => handleEditChange('acquisition_date', e.target.value)}
                          />
                        ) : (
                          equipment.acquisition_date 
                            ? new Date(equipment.acquisition_date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === equipment.id ? (
                          <Input
                            type="datetime-local"
                            value={editingData.next_maintenance 
                              ? new Date(editingData.next_maintenance).toISOString().slice(0, 16)
                              : ''
                            }
                            onChange={(e) => handleEditChange('next_maintenance', e.target.value)}
                          />
                        ) : (
                          equipment.next_maintenance 
                            ? new Date(equipment.next_maintenance).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === equipment.id ? (
                          <select
                            value={editingData.status || 'available'}
                            onChange={(e) => handleEditChange('status', e.target.value)}
                            className={styles.select}
                          >
                            <option value="available">Disponível</option>
                            <option value="in_use">Em Uso</option>
                            <option value="maintenance">Manutenção</option>
                            <option value="unavailable">Indisponível</option>
                          </select>
                        ) : (
                          <Badge variant={getStatusBadgeVariant(equipment.status)}>
                            {getStatusLabel(equipment.status)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(equipment.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        {equipment.model || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {editingId === equipment.id ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={saveEditing}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEditing}
                                className="text-gray-600 hover:text-gray-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEditing(equipment)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteEquipment(equipment.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredEquipments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum equipamento encontrado.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}