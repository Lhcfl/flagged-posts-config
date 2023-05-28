# frozen_string_literal: true

# name: flagged-posts-config
# about: Allow to config who can see flagged posts
# version: 0.0.1
# authors: Lhc_fl
# url: https://github.com/Lhcfl/flagged-posts-config
# required_version: 3.0.0

enabled_site_setting :flagged_posts_config_enabled

after_initialize do

  add_to_class(:guardian, :can_see_hidden_post?) do |post|
    return true if SiteSetting.can_see_flagged_posts_groups_map.include?(0)
    return false if anonymous?
    post.user_id == @user.id || @user.staff? || @user.in_any_groups?(SiteSetting.can_see_flagged_posts_groups_map)
  end

  add_to_serializer(:current_user, :can_see_hidden_post) do
    user.staff? || user.in_any_groups?(SiteSetting.can_see_flagged_posts_groups_map)
  end
  
end