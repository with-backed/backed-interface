import { Table } from 'semantic-ui-react'

export default function CommuneDetailsTable({communeData, memberCount, controller}) {
 
  return(
    <Table basic='very' celled collapsing>
      <Table.Row> 
      <Table.Cell> Controller </Table.Cell>
      <Table.Cell> <a href={'https://etherscan.io/address/' + controller}>{controller}</a> </Table.Cell>
      </Table.Row> 
      <Table.Row> 
      <Table.Cell> Asset </Table.Cell>
      <Table.Cell>  {communeData.assetSymbol} (<a href={'https://etherscan.io/address/' + communeData.asset}>{communeData.asset}</a>) </Table.Cell>
      </Table.Row> 
      <Table.Row> 
      <Table.Cell> Members </Table.Cell>
      <Table.Cell> {memberCount} </Table.Cell>
      </Table.Row> 
      <Table.Row> 
      <Table.Cell> Allows joining </Table.Cell>
      <Table.Cell> {communeData.allowsJoining.toString()} </Table.Cell>
      </Table.Row> 
      <Table.Row> 
      <Table.Cell> Commune controller can remove members </Table.Cell>
      <Table.Cell> {communeData.allowsRemoving.toString()} </Table.Cell>
      </Table.Row> 
      <Table.Row> 
      <Table.Cell> Allows non members to contribute </Table.Cell>
      <Table.Cell> {communeData.allowsOutsideContribution.toString()} </Table.Cell>
      </Table.Row> 
      </Table>
    )

  }