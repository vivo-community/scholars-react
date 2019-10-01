import React, { useState, useEffect, Fragment } from "react";
import _ from "lodash";
import { useRouter } from "../lib/react-router-hooks";
// NOTE: tried 'query-string' and 'querystring'
// but 'qs' seemed best
import qs from "qs";

import PagingPanel from "../components/paging";
import peopleQuery from "./query";
import client from "../lib/apollo";

//import DefaultImage from './assets/images/profile_picture_u39_a.png'
//import DefaultImage from 'profile_picture_u39_a.png'
//import assets from './assets'

function stringifyQuery(params) {
  let result = qs.stringify(params);
  return result ? "?" + result : "";
}

function parseQuery(qryString) {
  return qs.parse(qryString);
}

const PersonImage = ({ person }) => {
  if (person.thumbnail) {
    let url = `http://openvivo.org/${person.thumbnail}`;
    return <img className="img-thumbnail" width="90" src={url} />;
  } else {
    // TODO: how to get 'assetPath' in here?
    //const default = new Image()
    //default.src = DefaultImage
    //return (<img className="img-thumbnail" width="90" src={ DefaultImage } />)
    let url =
      "http://openvivo.org/images/placeholders/person.bordered.thumbnail.jpg";
    return <img className="img-thumbnail" width="90" src={url} />;
  }
};

const PersonCard = ({ person, cardStyle }) => {
  let title = person.preferredTitle || person.id;
  // NOTE: terrible way to do this
  let personName = person.name.replace("@en-US", "");
  personName = personName.replace("@en-GB", "");
  personName = personName.replace("@de-DE", "");
  personName = personName.replace("@en", "");

  return (
    <div className="card" key={person.id} style={cardStyle}>
      <h6 className="card-header">
        <a href={"/entities/person/" + person.id}>{personName}</a>
      </h6>

      <div className="card-body">
        <p className="card-text">{title}</p>
        <div className="card-footer">
          <PersonImage person={person} />
        </div>
      </div>
    </div>
  );
};

const PersonGroup = ({ grouped }) => {
  const cardStyle = {
    width: "33%"
  };
  let results = "";
  return (
    <div className="card-group">
      {grouped.map(single => (
        <PersonCard key={single.id} person={single} cardStyle={cardStyle} />
      ))}
    </div>
  );
  return results;
};

const PeopleList = ({ people }) => {
  let chunked = _.chunk(people, 3);
  console.log("*** chunked ***");
  console.log(chunked);
  return (
    <Fragment>
      {chunked.map((grouped, index) => (
        <PersonGroup key={`people${index}`} grouped={grouped} />
      ))}
    </Fragment>
  );
};

const PeopleFacets = ({ facets, filters, onFacet }) => {
  return (
    <Fragment>
      {facets.map((facet, index) => (
        /* NOTE: needed a key here */
        <div key={`div-${facet.field}`} className="facets">
          <h3>{_.startCase(facet.field)}</h3>

          <ul className="list-group">
            {facet.entries.content.map((e, index2) => (
              <li
                className="list-group-item d-flex justify-content-between align-items-center"
                key={`lgi-${facet.field}+${e.value}`}
              >
                <label
                  className="facet-click"
                  htmlFor={`filters[${facet.field}+${e.value}]`}
                >
                  <input
                    id={`filters[${facet.field}+${e.value}]`}
                    defaultChecked={
                      !!_.find(filters, { field: facet.field, value: e.value })
                    }
                    onChange={evt => onFacet(facet.field, e.value, evt)}
                    type="checkbox"
                    name={`filters[${facet.field}]`}
                    value={e.value}
                  />
                  {e.value}
                </label>
                <span className="badge badge-primary badge-pill">
                  {e.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Fragment>
  );
};

const PersonSearch = props => {
  const [people, setPeople] = useState([]);
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
        console.log("trying to hit grapqhl");
        // supposed to be adding filters
        const { data } = await client.query({
          query: peopleQuery,
          variables: {
            pageNumber: pageNumber,
            search: query,
            filters: filters
          }
        });

        setPeople(data.personsFacetedSearch.content);
        setFacets(data.personsFacetedSearch.facets);
        setPage(data.personsFacetedSearch.page);

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
      pathname: "/search/people",
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
      pathname: "/search/people",
      search: `${params}`
    });
  };

  let onPage = pageNumber => {
    console.debug(`page=${pageNumber}`);
    setPageNumber(pageNumber);

    let obj = { search: query, pageNumber: pageNumber, filters: newFilters };
    let params = stringifyQuery(obj);

    props.history.push({
      pathname: "/search/people",
      search: params
    });
  };

  let facetsFragment = "";
  if (facets != undefined && facets.length > 0) {
    facetsFragment = (
      <div className="col-sm">
        <PeopleFacets facets={facets} filters={filters} onFacet={onFacet} />
      </div>
    );
  }

  let pagesFragment = "";
  if (page != undefined) {
    pagesFragment = (
      <div>
        <PagingPanel page={page} callback={onPage} />
      </div>
    );
  }

  let pageSummary = "";
  if (page != undefined) {
    pageSummary = <span>({page.totalElements})</span>;
  }

  return (
    <div>
      <h3>People {pageSummary}</h3>
      {pagesFragment}
      <form id="searchForm" onSubmit={handleSubmit}>
        <div>Query: </div>

        <div className="input-group search">
          <input
            name="search"
            type="text"
            key="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="form-control"
            placeholder="Search..."
            aria-label="Search"
            aria-describedby="basic-addon2"
          />

          <div className="input-group-append">
            <button
              className="btn btn-outline-success search-button"
              type="button"
            >
              Search
            </button>
          </div>
        </div>

        {isError && <div>Something went wrong ...</div>}

        {isLoading ? (
          <div>Loading ...</div>
        ) : (
          <div>
            <div className="row" key={`form-search-row`}>
              <div className="col-sm-8">
                <PeopleList people={people} />
              </div>
              <div className="col-sm-4">{facetsFragment}</div>{" "}
              {/* end col-sm */}
            </div>{" "}
            {/* end row */}
          </div>
        )}
      </form>
    </div>
  );
};

export default PersonSearch;
