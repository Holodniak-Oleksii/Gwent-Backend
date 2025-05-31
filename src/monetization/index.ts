import RefillEntity from "@/entities/Refill.entity";
import UserEntity from "@/entities/User.entity";

interface IHeadersInit {
  headers: {
    "X-Token": string;
  };
}

export const checkRefillTransactions = async (
  message: (balance: number) => Promise<void>
) => {
  try {
    const token = process.env.BANK_TOKEN;
    const accountId = process.env.DONATE_ID;
    const from = Math.floor(Date.now() / 1000) - 3600;

    const response = await fetch(
      `https://api.monobank.ua/personal/statement/${accountId}/${from}`,
      {
        headers: { "X-Token": token },
      } as IHeadersInit
    );

    if (!response.ok) throw new Error("Monobank API error");

    const transactions = await response.json();

    for (const tx of transactions) {
      if (!tx.comment || !tx.amount || tx.amount <= 0) continue;

      const code = tx.comment.trim();
      const amount = tx.amount;

      const intent = await RefillEntity.findOne({
        code,
        fulfilled: false,
      });

      if (intent) {
        const coinsToAdd = amount;
        await UserEntity.findByIdAndUpdate(intent.userId, {
          $inc: { coins: coinsToAdd },
        });
        intent.amount = amount;
        intent.fulfilled = true;
        await intent.save();
        await message(amount);
      }
    }
  } catch (error: any) {
    console.error("Failed to check Monobank transactions:", error.message);
  }
};
