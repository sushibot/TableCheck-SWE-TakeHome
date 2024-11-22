import { MongoClient, ObjectId, WithId } from "mongodb";
import {
  Waitlist,
  Party,
  InitialRestaurantState,
  NextPartyInWaitlist,
} from "../schema";
import { DINER, type Diner } from "./diner";

const clientConnect = async () => {
  let client: MongoClient | null = null;
  if (!client) {
    try {
      client = new MongoClient(process.env.DB_URL); // creates connection to MongoDB
      await client.connect();
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }
  return client;
};

const client = await clientConnect();

export const getAvailableSeats = async (): Promise<number> => {
  try {
    const diner = await client
      .db()
      .collection<Diner>("diner")
      .find({})
      .toArray();

    if (diner) {
      return diner[0].seats;
    } else {
      return 0;
    }
  } catch (error) {
    console.log("Error retrieving available seats: ", error);
    throw error;
  }
};

export const updateDinerSeats = async ({ seats }: { seats: number }) => {
  try {
    const availableSeats = await client
      .db()
      .collection<Diner>("diner")
      .findOneAndUpdate(
        {},
        { $set: { seats: seats } },
        { returnDocument: "after" }
      );
    return availableSeats;
  } catch (error) {
    console.log(`Error trying to update the seats: ${error}`);
    throw new Error();
  }
};

// creates initial party and sets the available seat count to 0;
export const createInitialDiner =
  async (): Promise<WithId<InitialRestaurantState> | null> => {
    const PARTY_NAME = "Jon Snow";
    const PARTY_SIZE = 10;
    try {
      const insertedResult = await client
        .db()
        .collection<Party>("party")
        .findOneAndUpdate(
          { partyName: PARTY_NAME },
          {
            $set: {
              id: DINER.INITIAL_DINER_ID,
              partyName: PARTY_NAME,
              size: PARTY_SIZE,
            },
          },
          { upsert: true }
        );
      const dinerId = await client.db().collection<Diner>("diner").findOne({});

      if (insertedResult && dinerId) {
        return {
          ...insertedResult,
          restaurantId: dinerId._id,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error in initialize: ", error);
      throw error;
    }
  };

export const getParty = async ({
  id,
}: {
  id: string;
}): Promise<WithId<Party> | null> => {
  try {
    const party = await client
      .db()
      .collection<Party>("party")
      .findOne({ _id: new ObjectId(id) });
    return party;
  } catch (error) {
    console.log(`Error retrieiving party information: ${error}`);
    throw new Error();
  }
};

export const getNextPartyInWaitlist =
  async (): Promise<WithId<NextPartyInWaitlist> | null> => {
    const session = client.startSession();
    try {
      let results = null;
      const nextPartyInWaitlist = await client
        .db()
        .collection<Waitlist>("waitlist")
        .find({}, { session })
        .sort({ jobId: 1 })
        .toArray(); // sorts ascending, which should return first job in waitlist
      const party = await client.db().collection<Party>("party").findOne(
        {
          _id: nextPartyInWaitlist[0].partyId,
        },
        { session }
      );
      if (party) {
        results = {
          partyName: party?.partyName,
          size: party?.size,
          jobId: party?.jobId,
          _id: party?._id,
          confirmationId: nextPartyInWaitlist[0]._id,
        };
      }
      return results;
    } catch (error) {
      session.abortTransaction();
      console.log(`Error finding next party in waitlist: ${error}`);
      throw new Error();
    } finally {
      session.endSession();
    }
  };
export const storePartyInWaitlist = async (
  newParty: Party
): Promise<{ waitlistedId: string; partyId: string }> => {
  const session = client.startSession();

  try {
    const createdParty = await client.db().collection<Party>("party").insertOne(
      {
        partyName: newParty.partyName,
        size: newParty.size,
      },
      { session }
    );

    const insertIntoWaitlist = await client
      .db()
      .collection("waitlist")
      .insertOne(
        {
          jobId: newParty.jobId,
          partyId: createdParty.insertedId,
          addedToWaitlistAt: Date.now(),
        },
        { session }
      );

    return {
      waitlistedId: insertIntoWaitlist.insertedId.toString(),
      partyId: createdParty.insertedId.toString(),
    };
  } catch (error) {
    console.log(`Error adding party to waitlist: ${error}`);
    session.abortTransaction();
    throw new Error();
  } finally {
    session.endSession();
  }
};

process.on("SIGTERM", async () => {
  await updateDinerSeats({ seats: 0 });
  await client.close(); // closes connection to MongoDB
});
