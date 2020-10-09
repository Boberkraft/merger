const { GraphQLClient } = require('graphql-request')
const { Headers } = require('cross-fetch');
const kleur = require('kleur');
const { getMergablePRGroups } = require('./mergable_pr_groups');
const { mergeAll } = require('./merge_pr');
const { tryAgainInput, mergeInput, commitHeadlineInput } = require('./inputs');

const token = process.env.GITHUB_GQL_TOKEN;
const key_words = ["skrypt"]

global.Headers = global.Headers || Headers;

function getGraphQLClient() {
    const endpoint = 'https://api.github.com/graphql';
    return new GraphQLClient(endpoint, {
        headers: {
            authorization: `Bearer ${token}`
        }
    });
};

async function validate(prs) {
    const not_mergable = prs.filter((pr) => pr.mergeable != "MERGEABLE");
    not_mergable.forEach((pr) => console.log(kleur.bold(kleur.red(`Error: ${pr.url} is not mergable`))));
    return !not_mergable.length;
};


async function print_warnings(prs) {
    for (const pr of prs) {
        for (const key_word of key_words) {
            if (pr.body.includes(key_word)) {
                console.log(kleur.bold(kleur.yellow(`Warning: ${pr.url} includes ${key_word}`)));
            }
        }
        if (pr.checksStatus && pr.checksStatus != "SUCCESS") {
            console.log(kleur.bold(kleur.yellow(`Warning: ${pr.url} some checks were not successful`)));
        }        
    }
};

async function main() {
    const graphQLClient = getGraphQLClient();
    let mergablePRGroups = await getMergablePRGroups(graphQLClient);
    if (!Object.keys(mergablePRGroups).length) {
        console.log("No pr to merge");
        return;
    }

    for (let [key, prs] of Object.entries(mergablePRGroups)) {
        let title = prs[0].title
        console.log(kleur.bold(`› ${title}`));
        let valid = false;
        while (!valid) {
            mergablePRGroups = await getMergablePRGroups(graphQLClient)
            prs = mergablePRGroups[key];
            console.log(prs);
            valid = await validate(prs);
            if (!valid) {
                const { tryAgain } = await tryAgainInput();
                if (!tryAgain) {
                    return false;
                }
            }
        }

        if (valid) {
            print_warnings(prs)
            const { merge } = await mergeInput();
            if (merge) {
                const { commitHeadline } = await commitHeadlineInput(title);
                await mergeAll(graphQLClient, prs, commitHeadline);
            }
        }
        console.log('');
    };
};

main().catch((error) => console.error(error))
