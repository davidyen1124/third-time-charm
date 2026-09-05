import Museum from '../museum/Museum'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Index() {
  usePageTitle('The Daylight Museum')
  return <Museum />
}
