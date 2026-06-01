<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TeamMemberController extends Controller
{
    public function index()
    {
        $members = TeamMember::orderBy('sort_order')->get();
        return response()->json(['success' => true, 'data' => $members]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'bio'  => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);

        $member = TeamMember::create($validated);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('team', 'public');
            $member->update(['image_url' => '/storage/' . $path]);
        }

        return response()->json(['success' => true, 'data' => $member], 201);
    }

    public function update(Request $request, $id)
    {
        $member = TeamMember::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'bio'  => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $member->update($validated);

        if ($request->hasFile('image')) {
            if ($member->image_url && str_starts_with($member->image_url, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $member->image_url));
            }
            $path = $request->file('image')->store('team', 'public');
            $member->update(['image_url' => '/storage/' . $path]);
        }

        return response()->json(['success' => true, 'data' => $member->fresh()]);
    }

    public function destroy($id)
    {
        $member = TeamMember::findOrFail($id);
        if ($member->image_url && str_starts_with($member->image_url, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $member->image_url));
        }
        $member->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa thành viên']);
    }
}
