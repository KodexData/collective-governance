import ProposalSidebar from './ProposalSidebar'

const ProposalSidebars: React.FC = () => {
  return (
    <>
      <ProposalSidebar proposalStatus='Pending' maxItems={3} />
      <ProposalSidebar proposalStatus='Queued' maxItems={3} />
      <ProposalSidebar proposalStatus='Active' maxItems={5} />
      <ProposalSidebar proposalStatus='Succeeded' maxItems={3} />
      <ProposalSidebar proposalStatus='Executed' maxItems={5} />
      <ProposalSidebar proposalStatus='Defeated' maxItems={5} />
      <ProposalSidebar proposalStatus='Canceled' maxItems={5} />
    </>
  )
}

export default ProposalSidebars
