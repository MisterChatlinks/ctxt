import { record } from "./default";

const PolicyRecord = {
    default: record,
};

/**
 * Retrieves a policy record from the `PolicyRecord` object based on the provided name.
 *
 * @param name - The key corresponding to the desired policy record in `PolicyRecord`.
 *               Must be a valid key of the `PolicyRecord` object.
 *
 * @returns The policy record associated with the provided name.
 *
 * @throws {Error} If the requested record does not exist in `PolicyRecord`.
 *                 The error message includes the requested name and a list of available keys.
 */
export function getPolicyRecord(name: keyof typeof PolicyRecord) {
    if (!PolicyRecord[name]) {
        throw (`[Monitext[getPolicyRecord]] The requested record "${name}" could not be found;\n[Availables] ${
            (Object.keys(PolicyRecord).map(function (r) {
                return `\n   - ${r}`;
            })).join("")
        }`);
    }
    return PolicyRecord[name];
}
