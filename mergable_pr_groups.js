const query = `
    query ($query: String!) {
        search(first: 100, query: $query, type: ISSUE) {
            nodes {
                ... on PullRequest {
                    id
                    number
                    title
                    body
                    url
                    baseRepository {
                        name
                    }
                    mergeable
                    headRefName

                    commits(last: 1){
                        nodes{
                            commit{
                                status {
                                    state
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

const variables = {
    query: "is:open is:pr org:joshuaBE label:mergable" // "is:open is:pr org:kongo555"
};

function groupPRs(mergablePRs) {
    const groupedPRs = {};

    for (const pr of mergablePRs) {
        const headRefName = pr.headRefName;
        groupedPRs[headRefName] = groupedPRs[headRefName] || [];
        delete pr.headRefName;

        if (pr.commits.nodes[0].commit.status) {
            pr.checksStatus = pr.commits.nodes[0].commit.status.state
        }
        delete pr.commits;

        groupedPRs[headRefName].push(pr);
    }
    return groupedPRs;
};

async function getMergablePRGroups(graphQLClient) {
    const data = await graphQLClient.request(query, variables);
    return groupPRs(data.search.nodes);
};

module.exports.getMergablePRGroups = getMergablePRGroups;
