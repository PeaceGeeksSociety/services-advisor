var services = angular.module('services');

services.factory('LongTask', [
    '$rootScope', '$q',
    ($rootScope, $q) => {
        // If you're about to perform a long-running task, wrap your function
        // with a call to this service. Either have your function return a
        // promise or call the 'complete()' function provided as a
        // parameter to your function to indicate that your task has completed.
        return new TaskManager($rootScope, new AsyncTaskRunner($q));
    }
]);

/**
 * Keeps a counter of active tasks that have been flagged as long-running.
 * Broadcasts to Angular's scope whenever the counter's state changes.
 * 
 * ** Runs task asynchronously using requestIdleCallback **
 * TODO: Might required a rIC polyfill for browsers that don't support
 *       (check http://caniuse.com)
 */
class TaskManager {

    constructor($scope, taskRunner) {
        this.$scope = $scope;
        this._taskRunner = taskRunner;
        this._taskId = 0;
        this._tasks = 0;
        this._callbacks = [];
    }

    async run(fn) {
        const taskId = this._taskId++;
        this._tasks = this._tasks + 1;
        this.updateAll(taskId);

        return this._taskRunner.run((onSuccess) => {
                const result = fn();
                onSuccess(result);
            })
            .then((result) => {
                this.complete(taskId);
                return result;
            })
            .catch((e) => {
                this.complete(taskId);
                throw e;
            });
    }

    complete(taskId) {
        this._tasks = this._tasks - 1;
        this.updateAll(taskId);
    }

    updateAll(taskId) {
        this.$scope.$broadcast('LongTask.update', {taskId, activeTasks: this._tasks > 0, numActive: this._tasks});
    }

}

/**
 * Allows us to run tasks asynchronously using requestIdleCallback and promises.
 * Note that the promise implementation is configurable, this allows us to use
 * Angular's lifecycle-aware implementation ($q).
 */
class AsyncTaskRunner {

    constructor(promiseFactory) {
        if (!promiseFactory) {
            promiseFactory = (fn) => new Promise(fn);
        }
        this._promiseFactory = promiseFactory;
    }

    run(task) {
        return this._promiseFactory((resolve, reject) => {
            requestIdleCallback(() => {
                try {
                    task(resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

}