const kleur = require('kleur');

async function mergePullRequest(graphQLClient, pr, commitHeadline) {
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
        pullRequestId: pr.id,
        mergeMethod: 'SQUASH',
        commitHeadline: `${commitHeadline} (#${pr.number})`,
        commitBody: ''
      }
    };

    const { mergePullRequest } = await graphQLClient.request(mutation, variables);
    console.log(`${kleur.green('✔')} ${kleur.bold(`merged ${mergePullRequest.pullRequest.url}`)}`);
};

async function mergeAll(graphQLClient, prs, commitHeadline) {
  let promises = prs.map((pr) => mergePullRequest(graphQLClient, pr, commitHeadline));
  await Promise.all(promises);
  console.log('All merged!');
};

module.exports.mergeAll = mergeAll;
