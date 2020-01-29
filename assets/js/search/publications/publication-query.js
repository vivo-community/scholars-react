import gql from "graphql-tag";

const publicationQuery = gql`
  query($search: String!, $pageNumber: Int!, $filters: [FilterArgInput]) {
    documents(
      facets: [{ field: "type" }, { field: "numberOfPages" }]
      filters: $filters
      paging: {
        pageSize: 100
        pageNumber: $pageNumber
        sort: { orders: [{ direction: ASC, property: "title" }] }
      }
      query: $search
    ) {
      content {
        id
        title
      }
      page {
        totalPages
        number
        size
        totalElements
      }
      facets {
        field
        entries {
          content {
            value
            count
          }
        }
      }
    }
  }
`;

export default publicationQuery;
