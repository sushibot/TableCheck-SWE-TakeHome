import { z } from "zod";

export const Waitlist = z.object({
  party: z.number(),
  name: z.string(),
  size: z.number(),
});

// export type Waitlist = z.infer<typeof Waitlist>;
