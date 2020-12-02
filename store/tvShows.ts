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

export const actions: ActionTree<TvShowsState, TvShowsState> = {
  async getTvShowsSeasons({ dispatch }, { item }) {
    try {
      console.log('get');
      const { data } = await this.$api.tvShows.getSeasons({
        userId: this.$auth.user.Id,
        seriesId: item.Id || ''
      });

      console.log(data);

      dispatch('getTvShowsSeasonsSuccess', data);
    } catch (err) {
      dispatch('getTvShowsSeasonsFailure', err);
    }
  },
  async getTvShowsSeasonsSuccess(
    { dispatch },
    response: BaseItemDtoQueryResult
  ) {
    await dispatch('ADD_TVSHOW_SEASONS', {
      seasons: response.Items
    });

    response.Items?.forEach(async (season) => {
      await dispatch('getTvShowsSeasonEpisodes', { season });
    });
  },
  async getTvShowsSeasonsFailure({ dispatch }, error) {
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
  async getTvShowsSeasonEpisodes({ dispatch }, { season }) {
    try {
      const { data } = await this.$api.items.getItems({
        userId: this.$auth.user.Id,
        parentId: season.Id,
        fields: [ItemFields.Overview]
      });

      dispatch('getTvShowsSeasonEpisodesSuccess', data);
    } catch (err) {
      dispatch('getTvShowsSeasonEpisodesFailure', err);
    }
  },
  async getTvShowsSeasonEpisodesSuccess(
    { dispatch },
    response: BaseItemDtoQueryResult
  ) {
    await dispatch('ADD_TVSHOW_SEASON_EPISODES', {
      seasonEpisodes: response.Items
    });
  },
  async getTvShowsSeasonEpisodesFailure({ dispatch }, error) {
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
