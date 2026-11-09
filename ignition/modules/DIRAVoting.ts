import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DIRAVotingModule = buildModule("DIRAVotingModule", (m) => {

    const dira = m.contract("DIRAVoting");

    return { dira };

});

export default DIRAVotingModule;