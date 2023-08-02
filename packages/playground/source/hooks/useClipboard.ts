import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'

interface UseClipboardOptions {
  disableNotification?: boolean
}

interface UseClipboard {
  copy: (text: string, options?: UseClipboardOptions) => void
}

/**
 * Returns a function that copies text to the clipboard and optionally shows a notification.
 *
 * @param {UseClipboardOptions} defaults - Default options for copy function.
 * @returns {UseClipboard} - An object containing a function to copy text to the clipboard.
 */
export default function useClipboard(defaults: UseClipboardOptions = {}): UseClipboard {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const copy = (text: string, options: UseClipboardOptions = defaults) => {
    navigator.clipboard.writeText(text)
    if (!options.disableNotification) {
      enqueueSnackbar(`${t('Copied to Clipboard')}: ${text}`, { variant: 'success' })
    }
  }

  return { copy }
}
