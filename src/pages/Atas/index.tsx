import { useState, useEffect } from 'react';
import styles from './Atas.module.css';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EditButton } from './components/EditButton';
import { AdminLogin } from './components/AdminLogin';
import { EditableAta } from './components/EditableAta';
import { AddAtaDialog } from './components/AddAtaDialog';
import { Plus } from 'lucide-react';

interface Ata {
  id: string;
  name: string;
  pdf_url: string;
  meeting_date: string;
  meeting_type: string;
  year_group: string;
}

const DEFAULT_YEAR_GROUPS = ['2025'];

export function Atas() {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedYearGroup, setSelectedYearGroup] = useState('2025');
  const { toast } = useToast();

  useEffect(() => {
    fetchAtas();
  }, []);

  const fetchAtas = async () => {
    try {
      const { data, error } = await supabase
        .from('atas')
        .select('*')
        .order('meeting_date', { ascending: false });

      if (error) throw error;
      setAtas(data || []);
    } catch (error) {
      console.error('Erro ao buscar atas:', error);
    }
  };

  const handleAddAta = async (name: string, pdfUrl: string, meetingDate: string, meetingType: string, yearGroup: string) => {
    const normalizedName = name.trim();
    const normalizedYearGroup = yearGroup.trim();

    try {
      const { error } = await supabase
        .from('atas')
        .insert({
          name: normalizedName,
          pdf_url: pdfUrl,
          meeting_date: meetingDate,
          meeting_type: meetingType,
          year_group: normalizedYearGroup,
        });

      if (error) throw error;

      setSelectedYearGroup(normalizedYearGroup);
      toast({ title: "Sucesso", description: "Ata adicionada com sucesso!" });
      await fetchAtas();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Erro ao adicionar ata", variant: "destructive" });
      throw error;
    }
  };

  const handleUpdateAta = async (id: string, name: string, pdfUrl: string) => {
    try {
      const { error } = await supabase
        .from('atas')
        .update({ name, pdf_url: pdfUrl })
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Sucesso", description: "Ata atualizada com sucesso!" });
      await fetchAtas();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Erro ao atualizar ata", variant: "destructive" });
    }
  };

  const handleDeleteAta = async (id: string) => {
    try {
      const { error } = await supabase
        .from('atas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Sucesso", description: "Ata excluída com sucesso!" });
      await fetchAtas();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Erro ao excluir ata", variant: "destructive" });
    }
  };

  const handleLoginSuccess = () => setIsEditMode(true);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsEditMode(false);
    toast({ title: "Logout", description: "Saindo do modo de edição" });
  };

  // Build dynamic year groups from data
  const yearGroups = Array.from(new Set([...DEFAULT_YEAR_GROUPS, ...atas.map(a => a.year_group)]));
  // Sort: ranges like "2010-2020" by first number, single years numerically
  yearGroups.sort((a, b) => {
    const na = parseInt(a);
    const nb = parseInt(b);
    return na - nb;
  });

  const filteredAtas = atas.filter(a => a.year_group === selectedYearGroup);

  // If selectedYearGroup doesn't exist in tabs, select the last one
  const activeTab = yearGroups.includes(selectedYearGroup) ? selectedYearGroup : yearGroups[yearGroups.length - 1];
  if (activeTab !== selectedYearGroup) {
    setSelectedYearGroup(activeTab);
  }

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.atas}>
        <h1 className={styles.title}>Atas</h1>

        <div className={styles.yearTabs}>
          {yearGroups.map(yg => (
            <button
              key={yg}
              className={`${styles.yearTab} ${selectedYearGroup === yg ? styles.yearTabActive : ''}`}
              onClick={() => setSelectedYearGroup(yg)}
            >
              {yg}
            </button>
          ))}
        </div>

        <div className={styles.container}>
          {filteredAtas.map((ata) => (
            <EditableAta
              key={ata.id}
              ata={ata}
              isEditMode={isEditMode}
              onUpdate={handleUpdateAta}
              onDelete={handleDeleteAta}
            />
          ))}

          {isEditMode && (
            <button
              type="button"
              className={styles.addButton}
              onClick={() => setShowAddDialog(true)}
              aria-label="Adicionar nova ata"
            >
              <Plus size={32} />
              <span style={{ marginLeft: 8, fontSize: 16, fontWeight: 600 }}>Adicionar Ata</span>
            </button>
          )}

          {!isEditMode && filteredAtas.length === 0 && (
            <p style={{ color: 'white', opacity: 0.7 }}>Nenhuma ata cadastrada para este período.</p>
          )}
        </div>
      </main>

      <EditButton
        onClick={() => setShowLogin(true)}
        isEditMode={isEditMode}
        onLogout={handleLogout}
      />

      <AdminLogin
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />

      <AddAtaDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddAta}
        defaultYearGroup={selectedYearGroup}
      />

      <Footer />
    </div>
  );
}
