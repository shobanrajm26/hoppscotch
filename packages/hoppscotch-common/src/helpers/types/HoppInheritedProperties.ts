import {
  GQLHeader,
  HoppGQLAuth,
  HoppRESTHeader,
  HoppRESTAuth,
} from "@hoppscotch/data"
import {HoppCollectionVariables} from "@hoppscotch/data/src"

export type HoppInheritedProperty = {
  auth: {
    parentID: string
    parentName: string
    inheritedAuth: HoppRESTAuth | HoppGQLAuth
  }
  headers: {
    parentID: string
    parentName: string
    inheritedHeader: HoppRESTHeader | GQLHeader
  }[]
  variables: {
    parentID: string
    parentName: string
    inheritedVariable: HoppCollectionVariables
  }[]
}
