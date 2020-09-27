const { GraphQLClient } = require('graphql-request')
const { Headers } = require('cross-fetch');
const kleur = require('kleur');

const { getMergablePRs } = require('./mergable_prs');
const { mergePullRequest } = require('./merge_pr');
const { mergeInput, commitHeadlineInput } = require('./inputs');

global.Headers = global.Headers || Headers;

const token = process.env.GITHUB_GQL_TOKEN;

function getGraphQLClient() {
    const endpoint = 'https://api.github.com/graphql';
    return new GraphQLClient(endpoint, {
        headers: {
            authorization: `Bearer ${token}`
        }
    });
};

async function main() {
    const graphQLClient = getGraphQLClient();
    const mergablePRs = await getMergablePRs(graphQLClient);
    for (const [title, prs] of Object.entries(mergablePRs)) {
        console.log(kleur.bold(`› ${title}`));
        console.log(prs);
        const { merge } = await mergeInput();
        if (merge) {
            const { commitHeadline } = await commitHeadlineInput(title);
            var promises = prs.map((pr) => mergePullRequest(graphQLClient, pr.id, commitHeadline))
            await Promise.all(promises);
            console.log('All merged!');
        }
        console.log('');
    };
};

main().catch((error) => console.error(error))
