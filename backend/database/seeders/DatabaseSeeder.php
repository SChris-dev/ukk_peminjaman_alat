<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default admin user
        User::create([
            'username' => 'admin',
            'email' => 'admin@example.com',
            'password' => 'password',
            'role' => 'admin',
        ]);

        // Create default petugas user
        User::create([
            'username' => 'petugas',
            'email' => 'petugas@example.com',
            'password' => 'password',
            'role' => 'petugas',
        ]);

        // Create default peminjam user
        User::create([
            'username' => 'peminjam',
            'email' => 'peminjam@example.com',
            'password' => 'password',
            'role' => 'peminjam',
        ]);
    }
}
