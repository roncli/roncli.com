/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const AdminContactsView = require("../../public/views/adminContacts"),
    Common = require("../includes/common"),
    Contact = require("../../src/models/contact"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #            ###                  #                    #
//   # #       #                       #   #                 #                    #
//  #   #   ## #  ## #    ##    # ##   #       ###   # ##   ####    ###    ###   ####    ###
//  #   #  #  ##  # # #    #    ##  #  #      #   #  ##  #   #         #  #   #   #     #
//  #####  #   #  # # #    #    #   #  #      #   #  #   #   #      ####  #       #      ###
//  #   #  #  ##  # # #    #    #   #  #   #  #   #  #   #   #  #  #   #  #   #   #  #      #
//  #   #   ## #  #   #   ###   #   #   ###    ###   #   #    ##    ####   ###     ##   ####
/**
 * A class that represents the admin contacts page.
 */
class AdminContacts extends RouterBase {
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

        route.path = "/admin/contacts";

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
     * @returns {Promise} A promise that resolves when the request is processed.
     */
    static async get(req, res) {
        const user = await User.getCurrent(req);

        if (!user || !await user.is("SiteAdmin")) {
            await Common.notFound(req, res, user);
            return;
        }

        const contacts = await Contact.getAll();

        const data = {contacts};

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: "Contacts - Admin - roncli.com",
                css: [],
                js: ["/js/adminContacts.js"],
                views: [
                    {
                        name: "AdminContactsView",
                        path: "/views/adminContacts.js"
                    }
                ],
                view: "AdminContactsView",
                jsClass: "AdminContacts",
                data
            });
        } else {
            res.status(200).send(await Common.page(
                /* html */`
                    <title>Contacts - Admin - roncli.com</title>
                    <meta name="og:description" content="Manage and edit contacts on roncli.com." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="Contacts Admin" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="Manage and edit contacts on roncli.com." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="Contacts Admin" />
                `,
                void 0,
                {js: ["/js/adminContacts.js"]},
                AdminContactsView.get(data),
                AdminContactsView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = AdminContacts;
