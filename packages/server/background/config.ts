import conf from 'conf';
import { Config } from 'hastycam.interface';

const store = new conf<Config>({
    configName: 'appConfig',
    defaults: {
        feeds: [],
    }
});

const get = <K extends keyof Config> (key: K): Config[K] => {
    return store.get(key);
};

const set = <K extends keyof Config> (key: K, value: Config[K]): void => {
    store.set(key, value);
}

const remove = (key: keyof Config): void => {
    store.delete(key);
}

const all = (): Config => {
    return {
        ...store.store,
    };
}

export const config = {
    get,
    set,
    remove,
    all,
};