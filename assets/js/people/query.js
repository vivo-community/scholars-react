import gql from "graphql-tag";

const peopleQuery = gql`
  query($search: String!, $pageNumber: Int!, $filters: [FilterArgInput]) {
    people(
      facets: [
        { field: "keywords" },
        { field: "researchAreas" }
      ]
      filters: $filters
      paging: {
        pageSize: 5
        pageNumber: $pageNumber
        sort: { orders: [{ direction: ASC, property: "name" }] }
      }
      query: $search
    ) {
      content {
        id
        name
        keywords
        thumbnail
        preferredTitle
        overview
        positions {
          title
        }
        publications {
          title
        }
      }
      page {
        totalElements
        totalPages
        number
        size
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

export default peopleQuery;
