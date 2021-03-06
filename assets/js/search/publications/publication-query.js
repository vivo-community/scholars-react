import gql from "graphql-tag";

const publicationQuery = gql`
  query($search: String!, $pageNumber: Int!, $pageSize: Int!,
    $filters: [FilterArgInput], $orders: [OrderInput], $boosts: [BoostArgInput]) {
    documents(
      boosts: $boosts,
      facets: [
        { field: "type", exclusionTag: "type"  }, 
        { field: "authors", exclusionTag: "authors" },
        { field: "publisher", exclusionTag: "publisher" },
        { field: "publicationDate", exclusionTag: "publicationDate" },
      ]
      filters: $filters
      paging: {
        pageSize: $pageSize
        pageNumber: $pageNumber
        sort: { orders: $orders }
      }
      query: {
        q: $search
      }
    ) {
      content {
        id
        title
        publicationDate
        authors {
          id
          label
        }
        publisher {
          label
        }
        abstractText
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
