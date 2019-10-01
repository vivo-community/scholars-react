import React, { useState, useEffect } from "react";
import _ from "lodash";
import { useRouter } from "../lib/react-router-hooks";
// NOTE: tried 'query-string' and 'querystring'
// but 'qs' seemed best
import qs from "qs";

//import PagingPanel from './paging'
import PagingPanel from "../components/paging";
import publicationQuery from "./query";
import client from "../lib/apollo";

function stringifyQuery(params) {
  let result = qs.stringify(params);
  return result ? "?" + result : "";
}

function parseQuery(qryString) {
  return qs.parse(qryString);
}

const PublicationSearch = props => {
  const [publications, setPublications] = useState([]);
  const [facets, setFacets] = useState([]);
  const [page, setPage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const { match, location, history } = useRouter();

  console.debug(`You are now at ${location.pathname}`);
  console.debug(`search=${location.search}`);

  const parsed = parseQuery(location.search.substring(1));
  console.debug("starting with params: %0", parsed);

  const defaultSearch = parsed.search ? parsed.search : "*";
  const [query, setQuery] = useState(defaultSearch);
  const defaultPage = parsed.pageNumber ? parsed.pageNumber : 0;
  const [pageNumber, setPageNumber] = useState(defaultPage);
  const defaultFilters = parsed.filters ? parsed.filters : [];
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    // get from url ????
    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        // supposed to be adding filters
        const { data } = await client.query({
          query: publicationQuery,
          variables: {
            pageNumber: pageNumber,
            search: query,
            filters: filters
          }
        });

        setPublications(data.documentsFacetedSearch.content);
        setFacets(data.documentsFacetedSearch.facets);
        setPage(data.documentsFacetedSearch.page);

        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsError(true);
      }
    };
    fetchData();
  }, [search, filters, pageNumber]);

  const handleSubmit = evt => {
    let qry = { search: query, pageNumber: 0 };
    let params = stringifyQuery(qry);
    props.history.push({
      pathname: "/search/publications",
      search: `${params}`
    });
    // need to build uri better
    // instead set props?
    // reset filters?
    setPageNumber(0);
    setFilters([]);

    evt.preventDefault();
  };

  const onFacet = (field, value, evt) => {
    // Expected type 'Map' but was 'Integer'
    let newFilters = [];
    if (evt.target.checked) {
      console.debug(`ADD filter by ${field} and ${value}`);
      // have to set via state to trigger updated graphql query
      newFilters = _.concat(filters, { field: field, value: value });
      setFilters(newFilters);
    } else {
      newFilters = _.without(
        filters,
        _.find(filters, {
          field: field,
          value: value
        })
      );
      setFilters(newFilters);
      // need to querystring them --> then also read them back in
      console.debug(`REMOVE filter by ${field} and ${value}`);
    }
    // NOTE: doesn't seem to resolve 'filters' here - as if it's
    // updated at a slightly different time

    let obj = { search: query, pageNumber: 0, filters: newFilters };
    let params = stringifyQuery(obj);
    props.history.push({
      pathname: "/search/publications",
      search: `${params}`
    });
  };

  let onPage = pageNumber => {
    console.debug(`page=${pageNumber}`);
    setPageNumber(pageNumber);

    let obj = { search: query, pageNumber: pageNumber, filters: newFilters };
    let params = stringifyQuery(obj);

    props.history.push({
      pathname: "/search/publications",
      search: params
    });
  };

  let facetsFragment = "";
  if (facets != undefined && facets.length > 0) {
    facetsFragment = (
      <div className="col-sm">
        {facets.map((facet, index) => (
          /* NOTE: needed a key here */
          <div key={`div-${facet.field}`}>
            <h3>{facet.field}</h3>

            <ul className="list-group">
              {facet.entries.content.map((e, index2) => (
                <li
                  className="list-group-item"
                  key={`lgi-${facet.field}+${e.value}`}
                >
                  <input
                    defaultChecked={
                      !!_.find(filters, { field: facet.field, value: e.value })
                    }
                    onChange={evt => onFacet(facet.field, e.value, evt)}
                    type="checkbox"
                    name={`filters[${facet.field}]`}
                    value={e.value}
                  />
                  {e.value} ({e.count})
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  let pagesFragment = "";
  if (page != undefined) {
    pagesFragment = (
      <div>
        <h3>
          page {page.number + 1} of {page.totalPages} pages
        </h3>
        <PagingPanel page={page} callback={onPage} />
      </div>
    );
  }

  return (
    <div>
      <h2>Publication Search</h2>
      {pagesFragment}
      <form id="searchForm" onSubmit={handleSubmit}>
        <div>Query: </div>

        <div className="form-group">
          <label htmlFor="search">Search:</label>
          <input
            type="text"
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="form-control"
            key="search"
            name="search"
            placeholder="search..."
          />
        </div>

        <button>Submit</button>

        {isError && <div>Something went wrong ...</div>}

        {isLoading ? (
          <div>Loading ...</div>
        ) : (
          <div>
            <div className="row" key={`form-search-row`}>
              <div className="col-sm">
                <ul className="list-group">
                  {publications.map(item => (
                    <li className="list-group-item" key={item.id}>
                      <a href={"/entities/publication/" + item.id}>
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-sm">{facetsFragment}</div> {/* end col-sm */}
            </div>{" "}
            {/* end row */}
          </div>
        )}
      </form>
    </div>
  );
};

export default PublicationSearch;
