import PageContent from "./components/PageContent"
import DatabaseStatus from "./components/DatabaseStatus"
import DevelopmentNotice from "./components/DevelopmentNotice"

export default function Page() {
  return (
    <>
      <DevelopmentNotice />
      <PageContent />
      <DatabaseStatus />
    </>
  )
}
