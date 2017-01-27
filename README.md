# How to contribute
<a href="https://zenhub.com"><img src="https://raw.githubusercontent.com/ZenHubIO/support/master/zenhub-badge.png"></a>
## Initial Setup
- create a github account and click the "Fork" button at the top right to fork this repository
- copy the ssh address (ex. `git@github.com:PeaceGeeksSociety/services-advisor.git`) and use it to clone the project
```
git clone <ssh address here>
```
- add services advisor as an upstream remote
```
git remote add upstream git@github.com:PeaceGeeksSociety/services-advisor.git
```

## Adding Features
**No new feature code should be merged into master**

All new feature code should be pull requested into a feature branch. We want to leave `master` for bugfixes until we are ready to do a full new release to http://advisor.unhcr.jo/.

To create a new branch in the main repo
```
git checkout -b feature_name
git push upstream feature_name
```

To create a pull request, make your changes and commit. Then
```bash
git push origin # will push your branch to YOUR fork
```
Go to your fork: https://github.com/your-username-here/services-advisor and you should see a button for your recently pushed branch that you can click to make a pull request.

**Make sure that the branch you're pull requesting into is the feature branch, not master**.

## Updating with what others have written
Since the updates go into the main repository and not your fork, you'll occasionally need to get the latest changes from the main repo.
```
git fetch upstream
```
Then you can merge or rebase those changes onto your branches.
```bash
git checkout master
git rebase upstream/master

# or
git checkout feature
git merge upstream/feature
```

# If you want to run your own version with different service data
- Modify `src/site-specific-config.js` to specify your languages and the urls for your service data
- If you're using Amani, then be sure to specify `"amani": true`
- If you're not using Amani and you want to generate your own data look at our schema here: TODO

# Building

This build uses npm, gulp, and browserify to manage dependencies.

Versions of node and npm we know work:
`npm 3.3.12`
`node 5.1.0`

To install gulp:

- run `npm install -g gulp`

To build the js/css:

- run `npm install` to download the 3rd party libs in `package.json`
- `cp src/site-specific-config.js.dist src/site-specific-config.js` to use the default config
- during development:
    - run `gulp` in the background, i.e. run `gulp` in a terminal and leave it running. It will automatically recompile
      `js/app.js` and `css.main.css` files as you edit the src files.
- when preparing for production:
    - run `gulp dist` to create minified `js.app.js` and `css/main.css` files.

# To run the project
- run `npm install -g http-server`
- run `http-server`
- go to `http://localhost:8080`
- in the future, since you've already installed http-server you can just run `http-server`

# To update services data
Run this script. Must have node installed, and have run `npm install`
```bash
service-list-retrieval/update-services-from-amani.sh
```
