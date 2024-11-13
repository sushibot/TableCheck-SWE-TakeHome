import { z } from "zod";

export const Waitlist = z.object({
  party: z.array(z.string()),
  name: z.string(),
  size: z.number(),
});

// export type Waitlist = z.infer<typeof Waitlist>;
