'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2, Lock, X, Trash2 } from 'lucide-react'
import { Button } from './ui/button'

interface DeleteModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  warningText: string
  requirePassword?: boolean
  onConfirm: (password?: string) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  isDangerous?: boolean
}

export function DeleteModal({
  isOpen,
  title,
  message,
  confirmText,
  warningText,
  requirePassword = false,
  onConfirm,
  onCancel,
  isLoading = false,
  isDangerous = false,
}: DeleteModalProps) {
  const [password, setPassword] = useState('')
  const [confirmInput, setConfirmInput] = useState('')
  const [passwordError, setPasswordError] = useState('')

  if (!isOpen) return null

  const handleConfirm = async () => {
    // Vérifier le mot de passe si requis
    if (requirePassword && !password) {
      setPasswordError('Por favor, insira a sua palavra-passe')
      return
    }

    // Vérifier le texte de confirmation pour les actions très dangereuses
    if (isDangerous && confirmInput !== confirmText) {
      setPasswordError('Texto de confirmação incorreto')
      return
    }

    try {
      await onConfirm(password || undefined)
      // Réinitialiser le formulaire
      setPassword('')
      setConfirmInput('')
      setPasswordError('')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleCancel = () => {
    setPassword('')
    setConfirmInput('')
    setPasswordError('')
    onCancel()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-2xl max-w-md w-full mx-4 p-6">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDangerous ? 'bg-red-100' : 'bg-yellow-100'}`}>
              {isDangerous ? (
                <Trash2 className="w-5 h-5 text-red-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-600 whitespace-pre-line">{message}</p>
        </div>

        {/* Avertissement */}
        <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${isDangerous ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDangerous ? 'text-red-600' : 'text-yellow-600'}`} />
          <p className={`text-sm font-medium ${isDangerous ? 'text-red-800' : 'text-yellow-800'}`}>
            {warningText}
          </p>
        </div>

        {/* Formulaire */}
        <div className="space-y-4 mb-6">
          {/* Confirmation texte pour actions très dangereuses */}
          {isDangerous && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Escreva &quot;{confirmText}&quot; para confirmar:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => {
                  setConfirmInput(e.target.value)
                  setPasswordError('')
                }}
                placeholder={confirmText}
                className="input-base font-mono text-sm"
              />
            </div>
          )}

          {/* Mot de passe */}
          {requirePassword && (
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <Lock className="w-3.5 h-3.5" />
                Palavra-passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError('')
                }}
                placeholder="Insira a sua palavra-passe"
                className="input-base"
              />
            </div>
          )}

          {/* Message d'erreur */}
          {passwordError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{passwordError}</p>
            </div>
          )}
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || (isDangerous && confirmInput !== confirmText) || (requirePassword && !password)}
            className={`flex-1 font-bold ${isDangerous ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-teal-500 hover:bg-teal-600 text-white'}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                A processar...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                Confirmar
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
