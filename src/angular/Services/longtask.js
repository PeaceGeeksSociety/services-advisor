var services = angular.module('services');

services.factory('LongTask', [
    '$rootScope',
    ($rootScope) => {
        // If you're about to perform a long-running task, wrap your function
        // with a call to this service. Either have your function return a
        // promise or call the 'complete()' function provided as a
        // parameter to your function to indicate that your task has completed.
        return new TaskManager($rootScope);
    }
]);

/**
 * Keeps a counter of active tasks that have been flagged as long-running.
 * Broadcasts to Angular's scope whenever the counter's state changes.
 */
class TaskManager {

    constructor(scope) {
        this._scope = scope;
        this._tasks = 0;
    }

    async run(fn) {
        this._tasks = this._tasks + 1;
        const state = {_completed: false};
        const complete = this.complete.bind(this, state);
        try {
            await fn(complete);
            complete();
        } catch (e) {
            complete();
            throw e;
        }
    }

    complete(state) {
        if (state._completed) {
            return;
        }
        state._completed = true;

        this._tasks = this._tasks - 1;
        this._scope.$broadcast('LongTask.update', {activeTasks: this._tasks > 0, numActive: this._tasks});
    }

}