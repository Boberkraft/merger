const kleur = require('kleur');

async function mergePullRequest(graphQLClient, id, commitHeadline) {
    const mutation = `
      mutation mergePullRequest($input: MergePullRequestInput!) {
        mergePullRequest(input: $input) {
          pullRequest {
            url
          }
        }
      }
    `;

    const variables = {
      input: {
        pullRequestId: id,
        mergeMethod: 'SQUASH',
        commitHeadline: commitHeadline,
        commitBody: ''
      }
    };

    const { mergePullRequest } = await graphQLClient.request(mutation, variables);
    console.log(`${kleur.green('✔')} ${kleur.bold(`merged ${mergePullRequest.pullRequest.url}`)}`);
};

module.exports.mergePullRequest = mergePullRequest;
