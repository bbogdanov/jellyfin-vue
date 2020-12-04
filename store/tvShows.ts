import { ActionTree, MutationTree } from 'vuex';
import { BaseItemDto, BaseItemDtoQueryResult, ItemFields } from '~/api/models';

export interface TvShowsState {
  seasons: BaseItemDto[];
  seasonEpisodes: BaseItemDto[][];
}

export const state = (): TvShowsState => ({
  seasons: [],
  seasonEpisodes: []
});

type MutationPayload = TvShowsState;

export const mutations: MutationTree<TvShowsState> = {
  ADD_TVSHOW_SEASONS(state: TvShowsState, { seasons }: MutationPayload) {
    state.seasons.push(...seasons);
  },
  ADD_TVSHOW_SEASON_EPISODES(
    state: TvShowsState,
    { seasonEpisodes }: MutationPayload
  ) {
    state.seasonEpisodes.push(...seasonEpisodes);
  },
  CLEAR_TVSHOWS_SEASONS(state: TvShowsState) {
    state.seasons = [];
  }
};

export const enum TvShowsActions {
  getTvShows = '[TV SHOWS] Get Seasons Request',
  getTvShowsSuccess = '[TV SHOWS] Get Seasons Request Success',
  getTvShowsFailure = '[TV SHOWS] Get Seasons Request Failure',
  getTvShowsSeasonEpisodes = '[TV SHOWS] Get Season Episodes Request',
  getTvShowsSeasonEpisodesSuccess = '[TV SHOWS] Get Season Episodes Request Success',
  getTvShowsSeasonEpisodesFailure = '[TV SHOWS] Get Season Episodes Request Failure'
}

export const actions: ActionTree<TvShowsState, TvShowsState> = {
  async [TvShowsActions.getTvShows]({ dispatch }, { item }) {
    try {
      const { data } = await this.$api.tvShows.getSeasons({
        userId: this.$auth.user.Id,
        seriesId: item.Id || ''
      });

      dispatch(TvShowsActions.getTvShowsSuccess, data);
    } catch (err) {
      dispatch(TvShowsActions.getTvShowsFailure, err);
    }
  },
  [TvShowsActions.getTvShowsSuccess](
    { dispatch, commit },
    response: BaseItemDtoQueryResult
  ) {
    commit('ADD_TVSHOW_SEASONS', {
      seasons: response.Items
    });

    response.Items?.forEach(async (season) => {
      await dispatch(TvShowsActions.getTvShowsSeasonEpisodes, { season });
    });
  },
  [TvShowsActions.getTvShowsFailure]: async ({ dispatch }, error) => {
    await dispatch(
      'snackbar/pushSnackbarMessage',
      {
        message: error.message || 'Getting tv shows issue',
        color: 'error'
      },
      {
        root: true
      }
    );
  },
  async [TvShowsActions.getTvShowsSeasonEpisodes]({ dispatch }, { season }) {
    try {
      const { data } = await this.$api.items.getItems({
        userId: this.$auth.user.Id,
        parentId: season.Id,
        fields: [ItemFields.Overview]
      });

      dispatch(TvShowsActions.getTvShowsSeasonEpisodesSuccess, data);
    } catch (err) {
      dispatch(TvShowsActions.getTvShowsSeasonEpisodesFailure, err);
    }
  },
  [TvShowsActions.getTvShowsSeasonEpisodesSuccess](
    { commit },
    response: BaseItemDtoQueryResult
  ) {
    commit('ADD_TVSHOW_SEASON_EPISODES', {
      seasonEpisodes: response.Items
    });
  },
  async [TvShowsActions.getTvShowsSeasonEpisodesFailure]({ dispatch }, error) {
    await dispatch(
      'snackbar/pushSnackbarMessage',
      {
        message: error.message || 'Getting tv show season episodes issue',
        color: 'error'
      },
      {
        root: true
      }
    );
  }
};

const namespace = 'tvShows';

export default namespace;
