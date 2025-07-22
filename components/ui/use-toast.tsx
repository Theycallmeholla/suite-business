import { toast } from 'sonner'
export const useToast = () => ({
  toast: (props: any) => toast(props.title, { description: props.description })
})
