import { prisma } from "@/lib/prisma";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
    const expenses = await prisma.expense.findMany({
        include: { category: true },
        orderBy: { date: "desc" },
    });

    const categories = await prisma.expenseCategory.findMany({
        orderBy: { name: "asc" },
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Expense Manager</h1>
                    <p className="text-muted-foreground">Total Expenses: ₹{totalExpenses.toFixed(2)}</p>
                </div>
                <ExpenseForm categories={categories} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{expense.category.name}</TableCell>
                                    <TableCell>{expense.notes || "-"}</TableCell>
                                    <TableCell className="text-right">₹{expense.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                            {expenses.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                        No expenses found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
