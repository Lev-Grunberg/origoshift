
import { UserData } from 'app/../packages/shared-types/CustomTypes';
import { defineStore } from 'pinia';
// import { GatheringState } from 'shared-types/CustomTypes';

const rootState: {
  jwt?: string
} = {
  jwt: undefined,
};

export const useUserStore = defineStore('user', {
  state: () => ({ ...rootState }),
  getters: {
    userData: (state) => {
      try {
        if (!state.jwt) {
          throw new Error('jwt is undefined');
        }
        return JSON.parse(window.atob(state.jwt.split('.')[1])) as UserData;
      } catch (e) {
        return undefined;
      }
    },
  },
});
