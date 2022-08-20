/**
 * @typedef {import("../../types/browser/viewTypes").HomeViewParameters} ViewTypes.HomeViewParameters
 */

//  #   #                       #   #    #
//  #   #                       #   #
//  #   #   ###   ## #    ###   #   #   ##     ###   #   #
//  #####  #   #  # # #  #   #   # #     #    #   #  #   #
//  #   #  #   #  # # #  #####   # #     #    #####  # # #
//  #   #  #   #  # # #  #       # #     #    #      # # #
//  #   #   ###   #   #   ###     #     ###    ###    # #
/**
 * A class that represents the home view.
 */
class HomeView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.HomeViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            ${!data.titles || data.titles.length === 0 ? /* html */`
                <div class="panel rounded">
                    <div class="panel-title rounded">Blog Temporarily Unavailable</div>
                </div>
            ` : /* html */`
                <div id="home-blog" class="panel rounded">
                    <div class="panel-title rounded-top"><h1>Recent Blog Posts</h1></div>
                    <div class="panel-list rounded-bottom grid-columns-3">
                        ${data.titles.map((title) => /* html */`
                            <div class="contents-row">
                                <a class="contents" href="${HomeView.Encoding.attributeEncode(title.url)}">
                                    <div><div class="title">${HomeView.Encoding.htmlEncode(title.title)}</div></div>
                                </a>
                                <a class="contents" href="${HomeView.Encoding.attributeEncode(title.url)}">
                                    <div><div class="date"><time class="timeago" datetime="${new Date(title.published).toISOString()}">${new Date(title.published).toUTCString()}</time></div></div>
                                </a>
                                <a class="contents tag-list" href="${HomeView.Encoding.attributeEncode(title.url)}">
                                    <div style="flex-wrap: wrap; column-gap: 4px; row-gap: 4px;">
                                        ${title.categories.map((c) => /* html */`
                                            <div class="tag">${HomeView.Encoding.htmlEncode(c)}</div>
                                        `).join("")}
                                    </div>
                                </a>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `}
            <div id="home-panels" class="grid grid-columns-2-fixed pad-top">
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h2>Music</h2></div>
                    <div class="panel-body rounded-bottom">
                        ${data.features.music.length === 0 ? "" : /* html */`
                            <div class="center"><h4><b>Features</b></h4></div>
                            ${data.features.music.map((feature) => /* html */`
                                <div class="center"><a href="${feature.url}">${HomeView.Encoding.htmlEncode(feature.title)}</a></div>
                            `).join("")}
                        `}
                        ${!data.recent || data.recent.length === 0 ? "" : /* html */`
                            <div class="center"><h4 ${data.features.music.length > 0 ? "class=\"pad-top\"" : ""}><b>Latest</b></h4></div>
                            <div class="grid-tight grid-middle grid-columns-2">
                            ${data.recent.map((track) => /* html */`
                                <div class="left"><a href="${track.url}">${HomeView.Encoding.htmlEncode(track.title)}</a></div>
                                <div class="right"><button class="add-to-media-player" data-source="soundcloud" data-url="${HomeView.Encoding.attributeEncode(track.uri)}"><i class="bi-plus"></i><i class="bi-music-note-beamed"></i></button></div>
                            `).join("")}
                            </div>
                        `}
                        ${!data.classics || data.classics.length === 0 ? "" : /* html */`
                            <div class="center"><h4 ${data.features.music.length > 0 || data.recent && data.recent.length > 0 ? "class=\"pad-top\"" : ""}><b>Classics</b></h4></div>
                            <div class="grid-tight grid-middle grid-columns-2">
                            ${data.classics.map((track) => /* html */`
                                <div class="left"><a href="${track.url}">${HomeView.Encoding.htmlEncode(track.title)}</a></div>
                                <div class="right"><button class="add-to-media-player" data-source="soundcloud" data-url="${HomeView.Encoding.attributeEncode(track.uri)}"><i class="bi-plus"></i><i class="bi-music-note-beamed"></i></button></div>
                            `).join("")}
                            </div>
                        `}
                    </div>
                </div>
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h2>Coding</h2></div>
                    <div class="panel-body rounded-bottom">
                        ${data.features.coding.length === 0 ? "" : /* html */`
                            <div class="center"><h4><b>Features</b></h4></div>
                            ${data.features.coding.map((feature) => /* html */`
                                <div class="center"><a href="${feature.url}">${HomeView.Encoding.htmlEncode(feature.title)}</a></div>
                            `).join("")}
                        `}
                        ${!data.releases || data.releases.length === 0 ? "" : /* html */`
                            <div class="center"><h4 ${data.features.coding.length > 0 || data.commits && data.commits.length > 0 ? "class=\"pad-top\"" : ""}><b>Latest Releases</b></h4></div>
                            ${data.releases.map((release) => /* html */`
                                <div class="grid-tight grid-columns-2">
                                    <div class="left ellipsis-overflow">${HomeView.Encoding.htmlEncode(release.name.split("\n").shift())}</div>
                                    <div class="right"><a href="${release.url}" ${release.url.startsWith("http") ? "target=\"blank\"" : ""}>${HomeView.Encoding.htmlEncode(release.repo.name)}</a></div>
                                </div>
                            `).join("")}
                        `}
                        ${!data.commits || data.commits.length === 0 ? "" : /* html */`
                            <div class="center"><h4 ${data.features.coding.length > 0 ? "class=\"pad-top\"" : ""}><b>Latest Commits</b></h4></div>
                            ${data.commits.map((commit) => /* html */`
                                <div class="grid-tight grid-columns-2">
                                    <div class="left ellipsis-overflow">${HomeView.Encoding.htmlEncode(commit.message.split("\n").shift())}</div>
                                    <div class="right"><a href="${commit.url}" ${commit.url.startsWith("http") ? "target=\"blank\"" : ""}>${HomeView.Encoding.htmlEncode(commit.repo.name)}</a></div>
                                </div>
                            `).join("")}
                        `}
                    </div>
                </div>
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h2>Gaming</h2></div>
                    <div class="panel-body rounded-bottom">
                        ${data.features.gaming.length === 0 ? "" : /* html */`
                            <div class="center"><h4><b>Features</b></h4></div>
                            ${data.features.gaming.sort((a, b) => a.order - b.order).map((feature) => /* html */`
                                <div class="center"><a href="${feature.url}">${HomeView.Encoding.htmlEncode(feature.title)}</a></div>
                            `).join("")}
                        `}
                        ${data.steamGames && data.steamGames.length > 0 ? /* html */`
                            <div class="center"><h4 ${data.features.gaming.length > 0 ? "class=\"pad-top\"" : ""}><b>Recent Steam Games</b></h4></div>
                            <div class="grid-tight grid-middle" style="grid-template-columns: 16px auto auto;">
                                ${data.steamGames.map((game) => /* html */`
                                    <div class="left" style="width: 16px;"><img src="${game.iconUrl}" alt="${HomeView.Encoding.attributeEncode(game.name)}" style="width: 16px; height: 16px;"></div>
                                    <div class="left"><a href="/steam/${game.appId}/${HomeView.Encoding.slugEncode(game.name)}">${HomeView.Encoding.htmlEncode(game.name)}</a></div>
                                    <div class="right">${game.playtimeTwoWeeks} minute${game.playtimeTwoWeeks === 1 ? "" : "s"}</div>
                                `).join("")}
                            </div>
                        ` : ""}
                        ${data.speedruns && data.speedruns.length > 0 ? /* html */`
                            <div class="center"><h4 ${data.features.gaming.length > 0 || data.steamGames && data.steamGames.length > 0 ? "class=\"pad-top\"" : ""}><b>Speedrun Records</b></h4></div>
                            <div class="grid-tight grid-columns-2">
                                ${data.speedruns.map((speedrun) => /* html */`
                                    <div class="left">#${speedrun.place} <a href="/gaming/speedruns/${HomeView.Encoding.attributeEncode(encodeURI(speedrun.gameId))}/${HomeView.Encoding.slugEncode(speedrun.game)}">${HomeView.Encoding.htmlEncode(speedrun.game)}</a> ${HomeView.Encoding.htmlEncode(speedrun.category)}${!speedrun.variables || speedrun.variables.length === 0 ? "" : /* html */`, ${speedrun.variables.map((variable) => HomeView.Encoding.htmlEncode(variable)).join(", ")}`}</div>
                                    <div class="right"><a href="${speedrun.url}" target="_blank">${HomeView.Time.formatTimespan(speedrun.time, 3)}</a></div>
                                `).join("")}
                            </div>
                        ` : ""}
                        ${data.necrodancer && data.necrodancer.length > 0 ? /* html */`
                            <div class="center"><h4 ${data.features.gaming.length > 0 || data.steamGames && data.steamGames.length > 0 || data.speedruns && data.speedruns.length > 0 ? "class=\"pad-top\"" : ""}><b>Crypt of the NecroDancer Records</b></h4></div>
                            <div class="grid-tight grid-columns-2">
                                ${data.necrodancer.map((run) => /* html */`
                                    <div class="left">#${run.rank} ${HomeView.Encoding.htmlEncode(run.name)}</div>
                                    <div class="right"><a href="${run.url}" target="_blank">${run.run === "Deathless" ? `${run.score} Win${run.score === 1 ? "" : "s"}${run.end && run.end.zone && run.end.level ? `, ${run.end.zone}-${run.end.level}` : ""}` : run.run === "Score" || run.run === "Seeded Score" ? `$${run.score}` : HomeView.Time.formatTimespan(run.score, 3)}</a></div>
                                `).join("")}
                            </div>
                        ` : ""}
                        ${data.ff14 ? /* html */`
                            <div class="center"><h4 ${data.features.gaming.length > 0 || data.steamGames && data.steamGames.length > 0 || data.speedruns && data.speedruns.length > 0 || data.necrodancer && data.necrodancer.length > 0 ? "class=\"pad-top\"" : ""}><b>Final Fantasy XIV Online</b></h4></div>
                            <div class="grid-tight grid-middle grid-columns-2">
                                <div class="right"><img src="${data.ff14.avatarUrl}" /></div>
                                <div class="left">
                                    ${data.ff14.titleTop && data.ff14.title ? `${data.ff14.title} ` : ""}<b>${HomeView.Encoding.htmlEncode(data.ff14.name)}</b>${!data.ff14.titleTop && data.ff14.title ? ` ${data.ff14.title}` : ""}<br />
                                    ${data.ff14.freeCompany ? HomeView.Encoding.htmlEncode(`<${data.ff14.freeCompany}>`) : ""} ${HomeView.Encoding.htmlEncode(data.ff14.server)} (${HomeView.Encoding.htmlEncode(data.ff14.dataCenter)})<br />
                                    ${HomeView.Encoding.htmlEncode(data.ff14.race)} ${HomeView.Encoding.htmlEncode(data.ff14.job)}<br />
                                    Level <b>${data.ff14.level}</b><br />
                                    <b>${data.ff14.achievementPoints}</b> Achievement Points
                                </div>
                            </div>
                        ` : ""}
                        ${data.d3 && data.d3.length > 0 ? /* html */`
                            <div class="center"><h4 ${data.features.gaming.length > 0 || data.steamGames && data.steamGames.length > 0 || data.speedruns && data.speedruns.length > 0 || data.necrodancer && data.necrodancer.length > 0 || data.ff14 ? "class=\"pad-top\"" : ""}><b>Diablo III</b></h4></div>
                            <div class="center">Level <b>${data.d3[0].level}</b> ${data.d3[0].seasonal ? "Seasonal" : ""} ${data.d3[0].hardcore ? "Hardcore" : ""} ${HomeView.Encoding.htmlEncode(data.d3[0].class)}</div>
                            ${data.d3[0].paragon ? /* html */`
                                <div class="center">Paragon Level <b>${data.d3[0].paragon}</b></div>
                            ` : ""}
                            <div class="center"><b>${data.d3[0].eliteKills}</b> Elite Kills</div>
                        ` : ""}
                        ${data.wow ? /* html */`
                            <div class="center"><h4 ${data.features.gaming.length > 0 || data.steamGames && data.steamGames.length > 0 || data.speedruns && data.speedruns.length > 0 || data.necrodancer && data.necrodancer.length > 0 || data.ff14 || data.d3 && data.d3.length > 0 ? "class=\"pad-top\"" : ""}><b>World of Warcraft</b></h4></div>
                            <div class="grid-tight grid-middle grid-columns-2">
                                <div class="right"><img src="${data.wow.avatarUrl}" /></div>
                                <div class="left">
                                    ${HomeView.Encoding.htmlEncode(data.wow.title).replace(/\{name\}/, `<b>${HomeView.Encoding.htmlEncode(data.wow.name)}</b>`)}<br />
                                    ${data.wow.guild ? HomeView.Encoding.htmlEncode(`<${data.wow.guild}>`) : ""} ${HomeView.Encoding.htmlEncode(data.wow.realm)}<br />
                                    ${HomeView.Encoding.htmlEncode(data.wow.race)} ${HomeView.Encoding.htmlEncode(data.wow.class)}<br />
                                    Level <b>${data.wow.level}</b><br />
                                    <b>${data.wow.achievementPoints}</b> Achievement Points
                                </div>
                            </div>
                        ` : ""}
                    </div>
                </div>
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h2>Life</h2></div>
                    <div class="panel-body rounded-bottom">
                        ${data.features.life.length === 0 ? "" : /* html */`
                            <div class="center"><h4><b>Features</b></h4></div>
                            ${data.features.life.map((feature) => /* html */`
                                <div class="center"><a href="${feature.url}">${HomeView.Encoding.htmlEncode(feature.title)}</a></div>
                            `).join("")}
                        `}
                    </div>
                </div>
            </div>
            ${data.validated ? /* html */`
                <script>
                    Index.validated = true;
                </script>
            ` : ""}
            ${data.emailChangeAuthorized ? /* html */`
                <script>
                    Index.emailChangeAuthorized = true;
                </script>
            ` : ""}
            ${data.emailChanged ? /* html */`
                <script>
                    Index.emailChanged = true;
                </script>
            ` : ""}
            ${data.changePasswordSuccess ? /* html */`
                <script>
                    Index.changePasswordSuccess = true;
                </script>
            ` : ""}
            ${data.changeEmailSuccess ? /* html */`
                <script>
                    Index.changeEmailSuccess = true;
                </script>
            ` : ""}
        `;
    }

    //              #    ###           #
    //              #     #           # #
    //  ###   ##   ###    #    ###    #     ##
    // #  #  # ##   #     #    #  #  ###   #  #
    //  ##   ##     #     #    #  #   #    #  #
    // #      ##     ##  ###   #  #   #     ##
    //  ###
    /**
     * Gets the rendered info template.
     * @returns {string} An HTML string of the info.
     */
    static getInfo() {
        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Welcome</div>
                <div class="info-panel-body rounded-bottom">
                    <img src="/images/roncliSmall.png" style="float: left; padding-right: 3px;" />
                    Hello! You've found the homepage of me, Ronald M. Clifford, also known as <b>roncli</b> or <b>The Nightstalker</b>.<br /><br />
                    Here, you can check out my music, browse my coding projects, follow along with what games I'm playing, and check out everything else that makes life worth living.
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
HomeView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/time")} */
// @ts-ignore
HomeView.Time = typeof Time === "undefined" ? require("../js/common/time") : Time; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.HomeView = HomeView;
} else {
    module.exports = HomeView; // eslint-disable-line no-undef
}
