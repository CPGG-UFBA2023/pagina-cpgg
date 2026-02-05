import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Upload, X, FileText } from 'lucide-react'

interface TCCUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface PendingUpload {
  file: File
  studentName: string
}

export function TCCUploadModal({ isOpen, onClose, onSuccess }: TCCUploadModalProps) {
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentUpload, setCurrentUpload] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newUploads: PendingUpload[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type === 'application/pdf') {
        // Extract student name from filename (remove .pdf extension)
        const studentName = file.name.replace(/\.pdf$/i, '').replace(/_/g, ' ')
        newUploads.push({ file, studentName })
      }
    }

    setPendingUploads(prev => [...prev, ...newUploads])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const updateStudentName = (index: number, name: string) => {
    setPendingUploads(prev => 
      prev.map((item, i) => i === index ? { ...item, studentName: name } : item)
    )
  }

  const removeUpload = (index: number) => {
    setPendingUploads(prev => prev.filter((_, i) => i !== index))
  }

  const handleUploadAll = async () => {
    if (pendingUploads.length === 0) {
      toast.error('Nenhum arquivo para enviar')
      return
    }

    setUploading(true)
    setProgress(0)
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < pendingUploads.length; i++) {
      const { file, studentName } = pendingUploads[i]
      setCurrentUpload(studentName)

      try {
        // Upload file to storage
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tcc-geofisica')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          errorCount++
          continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('tcc-geofisica')
          .getPublicUrl(fileName)

        // Insert into database
        const { error: dbError } = await supabase
          .from('tcc_geofisica')
          .insert({
            student_name: studentName.trim(),
            pdf_url: urlData.publicUrl
          })

        if (dbError) {
          console.error('DB error:', dbError)
          errorCount++
          continue
        }

        successCount++
      } catch (err) {
        console.error('Error:', err)
        errorCount++
      }

      setProgress(((i + 1) / pendingUploads.length) * 100)
    }

    setUploading(false)
    setCurrentUpload('')

    if (successCount > 0) {
      toast.success(`${successCount} TCC(s) enviado(s) com sucesso!`)
      setPendingUploads([])
      onSuccess()
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} TCC(s) falharam no envio`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload de TCCs</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File selection */}
          <div>
            <Label>Selecionar PDFs</Label>
            <div className="mt-2 flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <Upload size={18} />
                Selecionar PDFs
              </label>
              <span className="text-sm text-gray-500">
                {pendingUploads.length} arquivo(s) selecionado(s)
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              O nome do arquivo será usado como nome do aluno (você pode editar abaixo)
            </p>
          </div>

          {/* Pending uploads list */}
          {pendingUploads.length > 0 && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              <Label>Arquivos pendentes</Label>
              {pendingUploads.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <FileText size={18} className="text-blue-600 flex-shrink-0" />
                  <Input
                    value={item.studentName}
                    onChange={(e) => updateStudentName(index, e.target.value)}
                    placeholder="Nome do aluno"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUpload(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Enviando: {currentUpload}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Fechar
            </Button>
            <Button 
              onClick={handleUploadAll} 
              disabled={uploading || pendingUploads.length === 0}
            >
              {uploading ? 'Enviando...' : `Enviar ${pendingUploads.length} TCC(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
