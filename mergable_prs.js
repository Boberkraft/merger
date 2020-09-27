const query = `
    query ($query: String!) {
        search(first: 100, query: $query, type: ISSUE) {
            nodes {
                ... on PullRequest {
                    id
                    title
                    body
                    url
                    baseRepository {
                        name
                    }
                }
            }
        }
    }
`;

const variables = {
    query: "is:open is:pr repo:kongo555/test"//"is:open is:pr org:joshuaBE label:mergable"
};

function groupPRs(mergablePRs) {
    const groupedPRs = {};

    for (const pr of mergablePRs) {
        const title = pr.title;
        groupedPRs[title] = groupedPRs[title] || [];
        delete pr.title;
        groupedPRs[title].push(pr);
    }
    return groupedPRs;
};

async function getMergablePRs(graphQLClient) {
    const data = await graphQLClient.request(query, variables);
    return groupPRs(data.search.nodes);
};

module.exports.getMergablePRs = getMergablePRs;
