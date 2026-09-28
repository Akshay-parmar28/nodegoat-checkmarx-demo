const ProfileDAO = require("../data/profile-dao").ProfileDAO;
const ESAPI = require("node-esapi");
const {
    environmentalScripts
} = require("../../config/config");

/* The ProfileHandler must be constructed with a connected db */
function ProfileHandler(db) {
    "use strict";

    const profile = new ProfileDAO(db);

    this.displayProfile = (req, res, next) => {
        const {
            userId
        } = req.session;

        profile.getByUserId(parseInt(userId), (err, doc) => {
            if (err) return next(err);

            doc.userId = userId;

            // Context-aware encoding to prevent Stored XSS
            doc.firstNameSafeString = ESAPI.encoder().encodeForHTML(doc.firstName || "");
            doc.lastNameSafeString = ESAPI.encoder().encodeForHTML(doc.lastName || "");
            doc.website = ESAPI.encoder().encodeForHTML(doc.website || "");
            doc.firstNameSafeURLString = ESAPI.encoder().encodeForURL(doc.firstName || "");

            return res.render("profile", {
                ...doc,
                environmentalScripts
            });
        });
    };

    this.handleProfileUpdate = (req, res, next) => {

        const {
            firstName,
            lastName,
            ssn,
            dob,
            address,
            bankAcc,
            bankRouting
        } = req.body;

        // Safer regex (removed the dangerous + quantifier)
        const regexPattern = /([0-9]+)\#/;
        const testComplyWithRequirements = regexPattern.test(bankRouting);

        if (testComplyWithRequirements !== true) {
            return res.render("profile", {
                updateError: "Bank Routing number does not comply with requirements for format specified",
                firstNameSafeString: ESAPI.encoder().encodeForHTML(firstName || ""),
                lastNameSafeString: ESAPI.encoder().encodeForHTML(lastName || ""),
                firstNameSafeURLString: ESAPI.encoder().encodeForURL(firstName || ""),
                lastName,
                ssn,
                dob,
                address,
                bankAcc,
                bankRouting,
                environmentalScripts
            });
        }

        const {
            userId
        } = req.session;

        profile.updateUser(
            parseInt(userId),
            firstName,
            lastName,
            ssn,
            dob,
            address,
            bankAcc,
            bankRouting,
            (err, user) => {

                if (err) return next(err);

                user.updateSuccess = true;
                user.userId = userId;

                // Encode before sending to the template
                user.firstNameSafeString = ESAPI.encoder().encodeForHTML(user.firstName || "");
                user.lastNameSafeString = ESAPI.encoder().encodeForHTML(user.lastName || "");
                user.firstNameSafeURLString = ESAPI.encoder().encodeForURL(user.firstName || "");

                return res.render("profile", {
                    ...user,
                    environmentalScripts
                });
            }
        );

    };

}

module.exports = ProfileHandler;