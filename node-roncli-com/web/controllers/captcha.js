/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const RouterBase = require("hot-router").RouterBase,
    svgCaptcha = require("svg-captcha");

//   ###                  #            #
//  #   #                 #            #
//  #       ###   # ##   ####    ###   # ##    ###
//  #          #  ##  #   #     #   #  ##  #      #
//  #       ####  ##  #   #     #      #   #   ####
//  #   #  #   #  # ##    #  #  #   #  #   #  #   #
//   ###    ####  #        ##    ###   #   #   ####
//                #
//                #
/**
 * A class that represents a captcha image.
 */
class Captcha extends RouterBase {
    //                    #
    //                    #
    // ###    ##   #  #  ###    ##
    // #  #  #  #  #  #   #    # ##
    // #     #  #  #  #   #    ##
    // #      ##    ###    ##   ##
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/captcha";

        return route;
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {void}
     */
    static get(req, res) {
        const captcha = svgCaptcha.create();

        req.session.captcha = {text: captcha.text, expires: new Date(new Date().getTime() + 300000)};

        res.writeHead(200, {"Content-Type": "image/svg+xml", "Cache-Control": "no-store"});
        res.end(captcha.data);
    }
}

module.exports = Captcha;
