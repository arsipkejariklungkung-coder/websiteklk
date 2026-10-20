#!/usr/bin/env python3
import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'kertagosa.db')

def seed_organization():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("DELETE FROM organization_members")

    # Member list: (id, name, position, level, parent_id, photo_url, nip, rank, order_num)
    members = [
        # Level 1: Pimpinan
        (1, "R. Indra Senjaya, S.H., M.H.", "Kepala Kejaksaan Negeri Klungkung", 1, None, "/static/images/kajari-portrait.jpg", "19750512 199903 1 002", "Jaksa Utama Pratama / IV-b", 1),

        # Level 2: 6 Kepala Seksi / Bagian (sejajar horizontal)
        (2, "I Nyoman Triantara, S.H.", "Kepala Subbagian Pembinaan", 2, 1, "/static/images/avatar-officer-male.svg", "19780814 200212 1 003", "Jaksa Madya / IV-a", 1),
        (3, "I Putu Deny Krisna, S.H., M.H.", "Kepala Seksi Intelijen", 2, 1, "/static/images/avatar-officer-male.svg", "19820410 200604 1 008", "Jaksa Madya / IV-a", 2),
        (4, "I Kadek Wahyudi, S.H.", "Kepala Seksi Tindak Pidana Umum", 2, 1, "/static/images/avatar-officer-male.svg", "19840215 200801 1 004", "Jaksa Muda / III-d", 3),
        (5, "Putu Gede Darmawan, S.H.", "Kepala Seksi Tindak Pidana Khusus", 2, 1, "/static/images/avatar-officer-male.svg", "19830722 200703 1 005", "Jaksa Madya / IV-a", 4),
        (6, "Ni Made Lestari, S.H., M.H.", "Kepala Seksi Perdata & Tata Usaha Negara", 2, 1, "/static/images/avatar-officer-female.svg", "19850918 200902 2 006", "Jaksa Muda / III-d", 5),
        (7, "I Dewa Gede Raka, S.H.", "Kepala Seksi PB3R (Barang Bukti & Rampasan)", 2, 1, "/static/images/avatar-officer-male.svg", "19811105 200501 1 007", "Jaksa Muda / III-d", 6),

        # Level 3: 2 Sub-bagian / Urusan di bawah masing-masing Kepala Seksi
        # Under Subbag Pembinaan (parent: 2)
        (8, "Ni Ketut Sukasih, S.E.", "Kaur Kepegawaian, Keuangan & PNBP", 3, 2, "/static/images/avatar-officer-female.svg", "19860312 201001 2 011", "Penata Tingkat I / III-d", 1),
        (9, "I Made Sujana, S.Kom.", "Kaur Perlengkapan, Daskrimti & TU", 3, 2, "/static/images/avatar-officer-male.svg", "19880724 201101 1 012", "Penata Muda / III-a", 2),

        # Under Seksi Intelijen (parent: 3)
        (10, "I Wayan Widnyana, S.H.", "Kasubsi Penyelidikan & Pengamanan Intelijen", 3, 3, "/static/images/avatar-officer-male.svg", "19890516 201212 1 013", "Ajun Jaksa / III-b", 1),
        (11, "Ni Putu Suryani, S.H.", "Kasubsi Penerangan Hukum, Humas & JMS", 3, 3, "/static/images/avatar-officer-female.svg", "19910120 201403 2 014", "Ajun Jaksa / III-b", 2),

        # Under Seksi Pidum (parent: 4)
        (12, "Ida Bagus Made Yoga, S.H.", "Kasubsi Prapenuntutan Tindak Pidana Umum", 3, 4, "/static/images/avatar-officer-male.svg", "19900808 201312 1 015", "Ajun Jaksa Madya / III-c", 1),
        (13, "I Gede Arya Putra, S.H.", "Kasubsi Penuntutan, Eksekusi & Eksaminasi", 3, 4, "/static/images/avatar-officer-male.svg", "19920214 201502 1 016", "Ajun Jaksa / III-b", 2),

        # Under Seksi Pidsus (parent: 5)
        (14, "Kadek Agus Wirawan, S.H.", "Kasubsi Penyidikan & Intelijen Tipikor", 3, 5, "/static/images/avatar-officer-male.svg", "19891127 201301 1 017", "Ajun Jaksa Madya / III-c", 1),
        (15, "Ni Luh Komang Santi, S.H.", "Kasubsi Penuntutan & Upaya Hukum Pidsus", 3, 5, "/static/images/avatar-officer-female.svg", "19910603 201402 2 018", "Ajun Jaksa / III-b", 2),

        # Under Seksi Datun (parent: 6)
        (16, "Anak Agung Gede Rai, S.H.", "Kasubsi Perdata (Bantuan & Pertimbangan)", 3, 6, "/static/images/avatar-officer-male.svg", "19900418 201310 1 019", "Ajun Jaksa Madya / III-c", 1),
        (17, "Ni Kadek Dwi Anggraini, S.H.", "Kasubsi TUN & Pelayanan Hukum Gratis", 3, 6, "/static/images/avatar-officer-female.svg", "19930709 201601 2 020", "Ajun Jaksa / III-b", 2),

        # Under Seksi PB3R (parent: 7)
        (18, "I Wayan Gede Sunarta, A.Md.", "Kasubsi Inventarisasi & Pengelolaan BB", 3, 7, "/static/images/avatar-officer-male.svg", "19921004 201503 1 021", "Pengatur Tingkat I / II-d", 1),
        (19, "I Komang Arimbawa, S.H.", "Kasubsi Pengembalian & Rampasan Lelang", 3, 7, "/static/images/avatar-officer-male.svg", "19940315 201701 1 022", "Ajun Jaksa / III-b", 2),

        # Level 4: Jabatan Fungsional (baris paling bawah)
        (20, "Dr. I Gusti Ayu Ratih, S.H., M.H.", "Jaksa Fungsional Penuntut Ahli Madya", 4, 1, "/static/images/avatar-officer-female.svg", "19800612 200501 2 009", "Jaksa Madya / IV-a", 1),
        (21, "I Ketut Budiarta, S.H.", "Jaksa Fungsional Penuntut Ahli Muda", 4, 1, "/static/images/avatar-officer-male.svg", "19870125 201012 1 023", "Jaksa Muda / III-d", 2),
        (22, "Ni Nyoman Dewi Astuti, S.E.", "Auditor Forensik Kerugian Keuangan Negara", 4, 1, "/static/images/avatar-officer-female.svg", "19890919 201301 2 024", "Penata Tingkat I / III-d", 3),
        (23, "I Dewa Putu Alit, S.Kom.", "Pranata Komputer & Analis Sistem Yustisial", 4, 1, "/static/images/avatar-officer-male.svg", "19920511 201502 1 025", "Penata / III-c", 4),
        (24, "Ni Made Sri Wahyuni, S.H.", "Analis Penuntutan & Pengelola Informasi", 4, 1, "/static/images/avatar-officer-female.svg", "19950821 201801 2 026", "Penata Muda Tingkat I / III-b", 5),
    ]

    cursor.executemany("""
    INSERT INTO organization_members (id, name, position, level, parent_id, photo_url, nip, rank, order_num, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    """, members)

    conn.commit()
    conn.close()
    print(f"Successfully seeded {len(members)} organization members!")

if __name__ == '__main__':
    seed_organization()
