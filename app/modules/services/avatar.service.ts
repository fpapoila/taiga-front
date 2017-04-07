/*
 * Copyright (C) 2014-2015 Taiga Agile LLC <taiga@taiga.io>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * File: avatar.service.coffee
 */

class AvatarService {
    constructor(config) {
        this.config = config;
        let IMAGES = [
            `/${window._version}/images/user-avatars/user-avatar-01.png`,
            `/${window._version}/images/user-avatars/user-avatar-02.png`,
            `/${window._version}/images/user-avatars/user-avatar-03.png`,
            `/${window._version}/images/user-avatars/user-avatar-04.png`,
            `/${window._version}/images/user-avatars/user-avatar-05.png`
        ];

        let COLORS = [
            "rgba( 178, 176, 204, 1 )",
            "rgba( 183, 203, 131, 1 )",
            "rgba( 210, 198, 139, 1 )",
            "rgba( 214, 161, 212, 1 )",
            "rgba( 247, 154, 154, 1 )"
        ];

        this.logos = _.cartesianProduct(IMAGES, COLORS);
    }

    getDefault(key) {
        let idx = __mod__(murmurhash3_32_gc(key, 42), this.logos.length);
        let logo = this.logos[idx];

        return { src: logo[0], color: logo[1] };
    }

    getUnnamed() {
        return {
            url: `/${window._version}/images/unnamed.png`
        };
    }

    getAvatar(user, type) {
        let gravatar, logo, root;
        if (!user) { return this.getUnnamed(); }

        let avatarParamName = 'photo';

        if (type === 'avatarBig') {
            avatarParamName = 'big_photo';
        }

        let photo = null;

        if (user instanceof Immutable.Map) {
            gravatar = user.get('gravatar_id');
            photo = user.get(avatarParamName);
        } else {
            gravatar = user.gravatar_id;
            photo = user[avatarParamName];
        }

        if (!gravatar) { return this.getUnnamed(); }

        if (photo) {
            return {
                url: photo
            };
        } else if ((location.host.indexOf('localhost') !== -1) || !this.config.get("gravatar", true)) {
            root = location.protocol + '//' + location.host;
            logo = this.getDefault(gravatar);

            return {
                url: root + logo.src,
                bg: logo.color
            };
        } else {
            root = location.protocol + '//' + location.host;
            logo = this.getDefault(gravatar);

            let logoUrl = encodeURIComponent(root + logo.src);

            return {
                url: `https://www.gravatar.com/avatar/${gravatar}?d=${logoUrl}`,
                bg: logo.color
            };
        }
    }
}

angular.module("taigaCommon").service("tgAvatarService", ["$tgConfig", AvatarService]);

function __mod__(a, b) {
  a = +a;
  b = +b;
  return (a % b + b) % b;
}