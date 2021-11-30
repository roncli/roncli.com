/**
 * @typedef {import("../../types/browser/viewTypes").GamingViewParameters} ViewTypes.GamingViewParameters
 * @typedef {import("../../types/browser/viewTypes").GamingViewInfoParameters} ViewTypes.GamingViewInfoParameters
 */

//   ###                   #                  #   #    #
//  #   #                                     #   #
//  #       ###   ## #    ##    # ##    ## #  #   #   ##     ###   #   #
//  #          #  # # #    #    ##  #  #  #    # #     #    #   #  #   #
//  #  ##   ####  # # #    #    #   #   ##     # #     #    #####  # # #
//  #   #  #   #  # # #    #    #   #  #       # #     #    #      # # #
//   ###    ####  #   #   ###   #   #   ###     #     ###    ###    # #
//                                     #   #
//                                      ###
/**
 * A class that represents the gaming view.
 */
class GamingView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.GamingViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="grid">
                ${data.page ? /* html */`
                    <div>
                        ${data.page.page}
                    </div>
                ` : ""}
                ${data.recentSteamGames && data.recentSteamGames.length > 0 || data.steamGames && data.steamGames.length > 0 ? /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded-top"><h1>Steam Games</h1></div>
                        ${data.recentSteamGames && data.recentSteamGames.length > 0 ? /* html */`
                            <div class="panel-body center"><h4><b>Recently played:</b></h4></div>
                            <div class="panel-body grid-tight grid-middle grid-columns-3-min center-content">
                                ${data.recentSteamGames.map((game) => /* html */`
                                    <div class="left" style="width: 16px;"><img src="${game.iconUrl}" alt="${GamingView.Encoding.attributeEncode(game.name)}" style="width: 16px; height: 16px;" /></div>
                                    <div class="left"><a href="/steam/${game.appId}/${GamingView.Encoding.slugEncode(game.name)}">${GamingView.Encoding.htmlEncode(game.name)}</a></div>
                                    <div class="right">${game.playtimeTwoWeeks} minute${game.playtimeTwoWeeks === 1 ? "" : "s"}</div>
                                `).join("")}
                            </div>
                        ` : ""}
                        <div class="panel-body center"><h4 ${data.recentSteamGames.length > 0 ? "class=\"pad-top\"" : ""}><b>Most played:</b></h4></div>
                        <div class="panel-body grid-tight grid-middle grid-columns-3-min center-content">
                            ${data.steamGames.map((game) => /* html */`
                                <div class="left" style="width: 16px;"><img src="${game.iconUrl}" alt="${GamingView.Encoding.attributeEncode(game.name)}" style="width: 16px; height: 16px;" /></div>
                                <div class="left"><a href="/steam/${game.appId}/${GamingView.Encoding.slugEncode(game.name)}">${GamingView.Encoding.htmlEncode(game.name)}</a></div>
                                <div class="right">${(game.playtimeTotal / 60).toFixed(2)} hour${game.playtimeTotal === 60 ? "" : "s"}</div>
                            `).join("")}
                        </div>
                        <div class="panel-body rounded-bottom center">
                            <a href="/gaming/steam">View All Steam Games</a>
                        </div>
                    </div>
                ` : ""}
                ${data.speedruns && data.speedruns.length > 0 ? /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded-top"><h1>Speedrunning</h1></div>
                        <div class="panel-body center">
                            I speedrun several games, including Deathstate and Sublevel Zero, which I've <a href="/playlist/PLoqgd0t_KsN4RhSX3uGApabqOaV-ehDuD/gaming-live-speedrun-events">run at live speedrunning events</a> including <a href="https://twitter.com/calithonsr" target="_blank">Calithon</a> and <a href="https://gamesdonequick.com" target="_blank">Games Done Quick</a>.
                        </div>
                        ${data.speedruns && data.speedruns.length > 0 ? /* html */`
                            <div class="panel-body center"><h4><b>Top Speedruns:</b></h4></div>
                            <div class="panel-body grid-tight grid-columns-4-min center-content" style="grid-template-columns: min-content min-content auto min-content">
                                ${data.speedruns.map((speedrun) => /* html */`
                                    <div class="right">#${speedrun.place}</div>
                                    <div class="left"><a href="/gaming/speedrun/${GamingView.Encoding.attributeEncode(encodeURI(speedrun.gameId))}/${GamingView.Encoding.slugEncode(speedrun.game)}">${GamingView.Encoding.htmlEncode(speedrun.game)}</a></div>
                                    <div class="left ellipsis-overflow">${GamingView.Encoding.htmlEncode(speedrun.category)}${!speedrun.variables || speedrun.variables.length === 0 ? "" : /* html */`, ${speedrun.variables.map((variable) => GamingView.Encoding.htmlEncode(variable)).join(", ")}`}</div>
                                    <div class="right"><a href="${speedrun.url}" target="_blank">${GamingView.Time.formatTimespan(speedrun.time, 3)}</a></div>
                                `).join("")}
                            </div>
                        ` : ""}
                        <div class="panel-body rounded-bottom center">
                            <a href="/gaming/speedruns">View All Speedruns</a>
                        </div>
                    </div>
                ` : ""}
                ${data.necrodancer && data.necrodancer.length > 0 ? /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded-top"><img src="/images/necrodancer.png" alt="Crypt of the NecroDancer" style="height: 100px;" /></div>
                        <div class="panel-body center">
                            In addition to speedrunning, Crypt of the NecroDancer offers other play modes such as deathless win streaking and score running.
                        </div>
                        ${data.necrodancer && data.necrodancer.length > 0 ? /* html */`
                            <div class="panel-body center"><h4><b>Top NecroDancer Runs:</b></h4></div>
                            <div class="panel-body grid-tight grid-columns-3-min center-content">
                                ${data.necrodancer.map((run) => /* html */`
                                    <div class="right">#${run.rank}</div>
                                    <div class="left">${GamingView.Encoding.htmlEncode(run.name)}</div>
                                    <div class="right"><a href="${run.url}" target="_blank">${run.run === "deathless" ? `${Math.floor(run.score / 100)} Wins` : run.run === "score" || run.run === "seeded-score" ? `$${run.score}` : GamingView.Time.formatTimespan((100000000 - run.score) / 1000, 3)}</a></div>
                                `).join("")}
                            </div>
                        ` : ""}
                        <div class="panel-body rounded-bottom center">
                            <a href="/gaming/necrodancer">View All NecroDancer Runs</a>
                        </div>
                    </div>
                ` : ""}
                ${data.ff14 ? /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded-top"><img src="/images/ff14.png" alt="Final Fantasy XIV Online" style="height: 100px;" /></div>
                        <div class="panel-body center">
                            I typically play Final Fantasy XIV Online casually with Solitha and some other friends.
                        </div>
                        <div class="panel-body grid-tight grid-middle grid-columns-2-min center-content ${data.ff14.recentAchievements && data.ff14.recentAchievements.length > 0 ? "" : "rounded-bottom"}">
                            <div class="left" style="width: 96px;"><img src="${data.ff14.avatarUrl}" /></div>
                            <div class="left">
                                ${data.ff14.titleTop && data.ff14.title ? `${data.ff14.title} ` : ""}<b>${GamingView.Encoding.htmlEncode(data.ff14.name)}</b>${!data.ff14.titleTop && data.ff14.title ? ` ${data.ff14.title}` : ""}<br />
                                ${data.ff14.freeCompany ? GamingView.Encoding.htmlEncode(`<${data.ff14.freeCompany}>`) : ""} ${GamingView.Encoding.htmlEncode(data.ff14.server)} (${GamingView.Encoding.htmlEncode(data.ff14.dataCenter)})<br />
                                ${GamingView.Encoding.htmlEncode(data.ff14.race)} ${GamingView.Encoding.htmlEncode(data.ff14.job)}<br />
                                Level <b>${data.ff14.level}</b><br />
                                <b>${data.ff14.achievementPoints}</b> Achievement Points
                            </div>
                        </div>
                        ${data.ff14.recentAchievements && data.ff14.recentAchievements.length > 0 ? /* html */`
                            <div class="panel-body center"><h4><b>Recent Final Fantasy XIV Online Achievements:</b></h4></div>
                            <div class="panel-body grid-tight grid-middle grid-columns-4-min center-content rounded-bottom">
                                ${data.ff14.recentAchievements.map((achievement) => /* html */`
                                    <div class="left" style="width: 16px;"><img src="https://xivapi.com${achievement.icon}" alt="${GamingView.Encoding.attributeEncode(achievement.name)}" style="width: 16px;" /></div>
                                    <div class="left">${GamingView.Encoding.htmlEncode(achievement.name)}</div>
                                    <div class="right">${achievement.points} Point${achievement.points === 1 ? "" : "s"}</div>
                                    <div class="right"><time class="timeago" datetime="${new Date(achievement.timestamp).toISOString()}">${new Date(achievement.timestamp).toUTCString()}</time></div>
                                `).join("")}
                            </div>
                        ` : ""}
                    </div>
                ` : ""}
                ${data.d3 && data.d3.length > 0 ? /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded-top"><img src="/images/diablo3.png" alt="Diablo III" style="height: 100px;" /></div>
                        <div class="panel-body center">
                            I often play Diablo III with Solitha to complete the season journey.  Occasionally I will run a season solo and push the greater rift leaderboards.
                        </div>
                        <div class="panel-body center"><h4><b>Diablo III Characters:</b></h4></div>
                        <div class="panel-body grid-tight grid-columns-5-min center-content rounded-bottom">
                            ${data.d3.map((character) => /* html */`
                                <div class="left">${character.name}</div>
                                <div class="left">${character.seasonal ? "Seasonal" : ""} ${character.hardcore ? "Hardcore" : ""} ${GamingView.Encoding.htmlEncode(character.class)}</div>
                                <div class="right">Level <b>${character.level}</b></div>
                                <div class="right">${character.paragon ? /* html */`Paragon Level <b>${character.paragon}</b>` : ""}</div>
                                <div class="right"><b>${character.eliteKills}</b> Elite Kills</div>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
                ${data.wow ? /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded-top"><img src="/images/wow.png" alt="World of Warcraft" style="height: 100px;" /></div>
                        <div class="panel-body center">
                            I started playing World of Warcraft just before Burning Crusade released.  Solitha and I founded the guild Six Minutes to Release, which lives on as the social gaming group <a href="https://six.gg" target="_blank">Six Gaming</a>, where we raided for seven years.  I've since retired from raiding, but I still occasionally play casually with Solitha.
                        </div>
                        <div class="panel-body grid-tight grid-middle grid-columns-2-min center-content ${data.wow.recentAchievements && data.wow.recentAchievements.length > 0 ? "" : "rounded-bottom"}">
                            <div class="left" style="width: 84px;"><img src="${data.wow.avatarUrl}" /></div>
                            <div class="left">
                                ${GamingView.Encoding.htmlEncode(data.wow.title).replace(/\{name\}/, `<b>${GamingView.Encoding.htmlEncode(data.wow.name)}</b>`)}<br />
                                ${data.wow.guild ? GamingView.Encoding.htmlEncode(`<${data.wow.guild}>`) : ""} ${GamingView.Encoding.htmlEncode(data.wow.realm)}<br />
                                ${GamingView.Encoding.htmlEncode(data.wow.race)} ${GamingView.Encoding.htmlEncode(data.wow.class)}<br />
                                Level <b>${data.wow.level}</b><br />
                                <b>${data.wow.achievementPoints}</b> Achievement Points
                            </div>
                        </div>
                        ${data.wow.recentAchievements && data.wow.recentAchievements.length > 0 ? /* html */`
                            <div class="panel-body center"><h4><b>Recent World of Warcraft Achievements:</b></h4></div>
                            <div class="panel-body grid-tight grid-middle grid-columns-4-min center-content rounded-bottom">
                                ${data.wow.recentAchievements.map((achievement) => /* html */`
                                    <div class="left" style="width: 16px;"><img src="${achievement.icon}" alt="${GamingView.Encoding.attributeEncode(achievement.name)}" style="width: 16px;" /></div>
                                    <div class="left">${GamingView.Encoding.htmlEncode(achievement.name)}</div>
                                    <div class="right">${achievement.points} Point${achievement.points === 1 ? "" : "s"}</div>
                                    <div class="right"><time class="timeago" datetime="${new Date(achievement.timestamp).toISOString()}">${new Date(achievement.timestamp).toUTCString()}</time></div>
                                `).join("")}
                            </div>
                        ` : ""}
                    </div>
                ` : ""}
            </div>
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
     * @param {ViewTypes.GamingViewInfoParameters} data The info data.
     * @returns {string} An HTML string of the info.
     */
    static getInfo(data) {
        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Gaming</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li>Gaming</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    Welcome to roncli Gaming.  Learn about all of the games I play and find out what I'm up to in them.<br /><br />
                    Also, be sure to follow me on <a href="https://twitch.tv/roncli" target="_blank">Twitch</a> and watch live!
                </div>
            </div>
            ${data.page ? /* html */`
                ${data.page.parentPageId && data.page.siblingPages && data.page.siblingPages.length > 1 ? /* html */`
                    <div class="info-panel">
                        <div class="info-panel-title rounded-top">${GamingView.Encoding.htmlEncode(data.page.parentPages[data.page.parentPages.length - 1].shortTitle)}</div>
                        <div class="info-panel-list rounded-bottom">
                            ${data.page.siblingPages.map((p) => /* html */`
                                <a class="contents ${data.page.url === p.url ? "selected" : ""}" href="${p.url}">
                                    <div class="center">${GamingView.Encoding.htmlEncode(p.shortTitle)}</div>
                                </a>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
                ${data.page.childPages && data.page.childPages.length > 0 ? /* html */`
                    <div class="info-panel">
                        <div class="info-panel-title rounded-top">${GamingView.Encoding.htmlEncode(data.page.shortTitle)}</div>
                        <div class="info-panel-list rounded-bottom">
                            ${data.page.childPages.map((p) => /* html */`
                                <a class="contents" href="${p.url}">
                                    <div class="center">${GamingView.Encoding.htmlEncode(p.shortTitle)}</div>
                                </a>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
            ` : ""}
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
GamingView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/time")} */
// @ts-ignore
GamingView.Time = typeof Time === "undefined" ? require("../js/common/time") : Time; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.GamingView = GamingView;
} else {
    module.exports = GamingView; // eslint-disable-line no-undef
}
