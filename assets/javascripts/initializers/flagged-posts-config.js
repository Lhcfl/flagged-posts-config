import { withPluginApi } from "discourse/lib/plugin-api";
import { applyDecorators} from "discourse/widgets/widget";
import DecoratorHelper from "discourse/widgets/decorator-helper";
import I18n from "I18n";
import PostCooked from "discourse/widgets/post-cooked";
import { h } from "virtual-dom";

const pluginId = "flagged-posts-config";

function init(api) {
  api.reopenWidget("post-contents", {
    html(attrs, state) {
      let result = [
        new PostCooked(attrs, new DecoratorHelper(this), this.currentUser),
      ];

      if (attrs.requestedGroupName) {
        result.push(this.attach("post-group-request", attrs));
      }

      result = result.concat(applyDecorators(this, "after-cooked", attrs, state));

      if (
        attrs.cooked_hidden &&
        (this.siteSettings.can_see_flagged_posts_groups?.split('|').includes('0') ||
          this.currentUser?.can_see_hidden_post ||
          attrs.user_id === this.currentUser?.id)
      ) {
        result.push(this.attach("expand-hidden", attrs));
      }

      if (!state.expandedFirstPost && attrs.expandablePost) {
        result.push(this.attach("expand-post-button", attrs));
      }

      const extraState = {
        state: {
          repliesShown: !!state.repliesBelow.length,
          filteredRepliesShown: state.filteredRepliesShown,
        },
      };
      result.push(this.attach("post-menu", attrs, extraState));

      const repliesBelow = state.repliesBelow;
      if (repliesBelow.length) {
        result.push(
          h(
            `section.embedded-posts.bottom#embedded-posts__bottom--${this.attrs.post_number}`,
            [
              repliesBelow.map((p) => {
                return this.attach("embedded-post", p, {
                  model: p.asPost,
                  state: {
                    role: "region",
                    "aria-label": I18n.t("post.sr_embedded_reply_description", {
                      post_number: attrs.post_number,
                      username: p.username,
                    }),
                  },
                });
              }),
              this.attach("button", {
                title: "post.collapse",
                icon: "chevron-up",
                action: "toggleRepliesBelow",
                actionParam: "true",
                className: "btn collapse-up",
                translatedAriaLabel: I18n.t("post.sr_collapse_replies"),
              }),
            ]
          )
        );
      }

      return result;
    },
  });
}

export default {
  name: pluginId,

  initialize(container) {
    if (!container.lookup("site-settings:main").flagged_posts_config_enabled) {
      return;
    }
    withPluginApi("1.6.0", init);
  },
};
