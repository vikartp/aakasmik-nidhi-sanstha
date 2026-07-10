import User from "../models/User";
import Contribution from "../models/Contribution";
import Expense from "../models/Expense";

// ─── Type Definitions ────────────────────────────────────────────────

export interface ToolDefinition {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: Record<string, any>;
    };
}

export interface ToolHandler {
    (args: Record<string, any>): Promise<string>;
}

// ─── Tool Definitions (OpenAI Function Calling Schema) ───────────────

export const toolDefinitions: ToolDefinition[] = [
    {
        type: "function",
        function: {
            name: "get_total_members",
            description: "Get the total count of verified members in the sanstha.",
            parameters: {
                type: "object",
                properties: {},
                required: [],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_member_info",
            description:
                "Search for a member by name. Returns member details including name, father's name, occupation, membership date, and role. Use partial or full name to search.",
            parameters: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description:
                            "The name (or partial name) of the member to search for.",
                    },
                },
                required: ["name"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_all_members",
            description:
                "Get a list of all verified members with their basic info (name, father's name, role, membership date).",
            parameters: {
                type: "object",
                properties: {},
                required: [],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_total_contributions",
            description:
                "Get the total sum of all contributions made to the sanstha fund.",
            parameters: {
                type: "object",
                properties: {},
                required: [],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_member_contributions",
            description:
                "Get all contributions made by a specific member. Search by member name.",
            parameters: {
                type: "object",
                properties: {
                    memberName: {
                        type: "string",
                        description: "The name of the member whose contributions to fetch.",
                    },
                },
                required: ["memberName"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_monthly_contributions",
            description:
                "Get contributions for a specific month and year. Useful for checking monthly collection status.",
            parameters: {
                type: "object",
                properties: {
                    month: {
                        type: "number",
                        description: "Month number (1-12).",
                    },
                    year: {
                        type: "number",
                        description: "Year (e.g. 2025).",
                    },
                },
                required: ["month", "year"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_total_expenses",
            description: "Get the total sum of all expenses of the sanstha.",
            parameters: {
                type: "object",
                properties: {},
                required: [],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_recent_expenses",
            description: "Get the most recent expenses. Returns the last N expense entries.",
            parameters: {
                type: "object",
                properties: {
                    limit: {
                        type: "number",
                        description:
                            "Number of recent expenses to fetch. Defaults to 5.",
                    },
                },
                required: [],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_fund_balance",
            description:
                "Calculate the current fund balance of the sanstha (total contributions minus total expenses).",
            parameters: {
                type: "object",
                properties: {},
                required: [],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_admins",
            description:
                "Get the list of all admins and superadmins of the sanstha with their contact details.",
            parameters: {
                type: "object",
                properties: {},
                required: [],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_sanstha_info",
            description:
                "Get general information about Aakasmik Nidhi Sanstha — its purpose, rules, how it works, contribution schedule, etc.",
            parameters: {
                type: "object",
                properties: {},
                required: [],
            },
        },
    },
];

// ─── Tool Handlers ───────────────────────────────────────────────────

const toolHandlers: Record<string, ToolHandler> = {
    get_total_members: async () => {
        const count = await User.countDocuments({ verified: true });
        return JSON.stringify({ totalMembers: count });
    },

    get_member_info: async (args) => {
        const { name } = args;
        const members = await User.find(
            {
                name: { $regex: name, $options: "i" },
                verified: true,
            },
            "name fatherName occupation membershipDate role email profileUrl"
        );
        if (members.length === 0) {
            return JSON.stringify({
                message: `No verified member found with name matching "${name}".`,
            });
        }
        return JSON.stringify({ members });
    },

    get_all_members: async () => {
        const members = await User.find(
            { verified: true },
            "name fatherName role membershipDate occupation"
        ).sort({ name: 1 });
        return JSON.stringify({ totalCount: members.length, members });
    },

    get_total_contributions: async () => {
        const result = await Contribution.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const total = result.length > 0 ? result[0].total : 0;
        return JSON.stringify({ totalContributions: total });
    },

    get_member_contributions: async (args) => {
        const { memberName } = args;
        // First find the member
        const members = await User.find({
            name: { $regex: memberName, $options: "i" },
            verified: true,
        });
        if (members.length === 0) {
            return JSON.stringify({
                message: `No verified member found with name matching "${memberName}".`,
            });
        }
        const memberIds = members.map((m) => m._id);
        const contributions = await Contribution.find({
            userId: { $in: memberIds },
        })
            .populate("userId", "name fatherName")
            .sort({ contributionDate: -1 });

        const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
        return JSON.stringify({
            memberName: members.map((m) => m.name).join(", "),
            totalAmount,
            contributionCount: contributions.length,
            contributions: contributions.map((c) => ({
                amount: c.amount,
                date: c.contributionDate,
                verifiedBy: c.verifiedBy,
            })),
        });
    },

    get_monthly_contributions: async (args) => {
        const { month, year } = args;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const contributions = await Contribution.find({
            contributionDate: { $gte: startDate, $lte: endDate },
        })
            .populate("userId", "name fatherName")
            .sort({ contributionDate: -1 });

        const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
        const monthName = startDate.toLocaleString("en-US", { month: "long" });

        return JSON.stringify({
            month: monthName,
            year,
            totalAmount,
            contributionCount: contributions.length,
            contributions: contributions.map((c) => ({
                memberName: (c.userId as any)?.name || "Unknown",
                amount: c.amount,
                date: c.contributionDate,
            })),
        });
    },

    get_total_expenses: async () => {
        const result = await Expense.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const total = result.length > 0 ? result[0].total : 0;
        return JSON.stringify({ totalExpenses: total });
    },

    get_recent_expenses: async (args) => {
        const limit = args.limit || 5;
        const expenses = await Expense.find()
            .sort({ createdAt: -1 })
            .limit(limit);
        return JSON.stringify({
            expenses: expenses.map((e) => ({
                amount: e.amount,
                description: e.description,
                updatedBy: e.updatedBy,
                date: (e as any).createdAt,
            })),
        });
    },

    get_fund_balance: async () => {
        const [contribResult, expenseResult] = await Promise.all([
            Contribution.aggregate([
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            Expense.aggregate([
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
        ]);
        const totalContributions =
            contribResult.length > 0 ? contribResult[0].total : 0;
        const totalExpenses =
            expenseResult.length > 0 ? expenseResult[0].total : 0;
        const balance = totalContributions - totalExpenses;
        return JSON.stringify({ totalContributions, totalExpenses, balance });
    },

    get_admins: async () => {
        const admins = await User.find(
            { role: { $in: ["admin", "superadmin"] } },
            "name role mobile profileUrl"
        );
        return JSON.stringify({ admins });
    },

    get_sanstha_info: async () => {
        return JSON.stringify({
            name: "आकस्मिक निधि संस्था (Aakasmik Nidhi Sanstha)",
            purpose:
                "A community-driven emergency fund (Aakasmik Nidhi) where members contribute regularly to build a collective fund. This fund is used to support members during emergencies and unforeseen situations.",
            howItWorks: [
                "Members register and get verified by admins.",
                "Each verified member contributes a fixed amount periodically (monthly).",
                "Contributions are tracked and verified by admins with payment screenshot proof.",
                "The collected fund is used for emergency support to members in need.",
                "All expenses from the fund are recorded with descriptions for transparency.",
            ],
            roles: {
                member: "Regular member who contributes to the fund.",
                admin: "Manages members, verifies contributions and screenshots.",
                superadmin:
                    "Has full control including managing admins and all operations.",
            },
            transparency:
                "All contributions and expenses are tracked digitally. Members can view their contribution history, and the overall fund status is transparent.",
        });
    },
};

// ─── Execute a tool by name ──────────────────────────────────────────

export const executeTool = async (
    toolName: string,
    args: Record<string, any>
): Promise<string> => {
    const handler = toolHandlers[toolName];
    if (!handler) {
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
    try {
        return await handler(args);
    } catch (error) {
        console.error(`Error executing tool ${toolName}:`, error);
        return JSON.stringify({
            error: `Failed to execute ${toolName}: ${(error as Error).message}`,
        });
    }
};
