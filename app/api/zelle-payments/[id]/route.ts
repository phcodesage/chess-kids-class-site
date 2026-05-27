import { NextRequest, NextResponse } from "next/server";
import { getZellePaymentsCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// PATCH - Update a Zelle payment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const collection = await getZellePaymentsCollection();
    
    const updateData: { status?: string; notes?: string; updatedAt?: string } = {
      updatedAt: new Date().toISOString(),
    };
    
    if (body.status) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;

    // Some payments use 'id' (UUID), older ones might only have '_id' (ObjectId)
    const query = ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: new ObjectId(id) }] }
      : { id };

    const result = await collection.updateOne(
      query,
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating Zelle payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a Zelle payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const collection = await getZellePaymentsCollection();
    
    const query = ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: new ObjectId(id) }] }
      : { id };

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting Zelle payment:", error);
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    );
  }
}
