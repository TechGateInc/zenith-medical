/**
 * Seed Doctor Profile Script
 * Creates the first doctor profile for Dr. Gabriel Oyelayo
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDoctorProfile() {
  try {
    console.log('🌱 Seeding doctor profile...');

    // First, check if the team member already exists
    let teamMember = await prisma.teamMember.findFirst({
      where: { name: 'Dr. Gabriel Oyelayo' }
    });

    if (teamMember) {
      // Update existing team member
      teamMember = await prisma.teamMember.update({
        where: { id: teamMember.id },
        data: {
          title: 'Family Physician',
          bio: 'British-trained Family Physician with extensive experience in family medicine and acute care.',
          isDoctor: true,
          credentials: 'MBBS, MRCGP, CCFP',
          experience: '15+ years',
          education: ['Medical School', 'Residency Training', 'Specialty Training'],
          certifications: ['Royal College of General Practitioners (UK)', 'College of Family Physicians of Canada'],
          languages: ['English', 'Yoruba'],
          specialties: ['Family Medicine', 'Lifestyle Medicine', 'General Wellness', 'Mental Health', 'Acute Care'],
          orderIndex: 1,
          published: true
        }
      });
      console.log('✅ Team member updated:', teamMember.name);
    } else {
      // Create new team member
      teamMember = await prisma.teamMember.create({
        data: {
          name: 'Dr. Gabriel Oyelayo',
          title: 'Family Physician',
          bio: 'British-trained Family Physician with extensive experience in family medicine and acute care.',
          isDoctor: true,
          credentials: 'MBBS, MRCGP, CCFP',
          experience: '15+ years',
          education: ['Medical School', 'Residency Training', 'Specialty Training'],
          certifications: ['Royal College of General Practitioners (UK)', 'College of Family Physicians of Canada'],
          languages: ['English', 'Yoruba'],
          specialties: ['Family Medicine', 'Lifestyle Medicine', 'General Wellness', 'Mental Health', 'Acute Care'],
          orderIndex: 1,
          published: true
        }
      });
      console.log('✅ Team member created:', teamMember.name);
    }

    // Check if doctor profile already exists
    let doctorProfile = await prisma.doctor.findUnique({
      where: { teamMemberId: teamMember.id }
    });

    if (doctorProfile) {
      // Update existing doctor profile
      doctorProfile = await prisma.doctor.update({
        where: { teamMemberId: teamMember.id },
        data: {
          professionalBio: `Dr. Gabriel Oyelayo is a British-trained Family Physician whose medical journey began in Nigeria before relocating to the United Kingdom. He initially served as a Specialty Doctor in Acute Medicine with the Northern Health and Social Care Trust in Northern Ireland, UK.

Following this, he pursued Family Medicine specialty training in Boston, Lincolnshire, gaining broad experience across various surgeries and hospitals in England. After completing his training, Dr. Oyelayo worked in multiple clinics in Ottawa before establishing Zenith Medical Centre.

He is deeply passionate about patient care, with a particular focus on lifestyle medicine, general wellness, and mental health. His approach blends evidence-based medicine with a compassionate, patient-centered care.

Dr. Oyelayo is an active member of both the Royal College of General Practitioners (UK) and the College of Family Physicians of Canada. He holds medical licences with the College of Physicians and Surgeons of Ontario and the General Medical Council in the United Kingdom.`,
          medicalSchool: 'University of Ibadan, Nigeria',
          graduationYear: 2008,
          residency: 'Family Medicine, Boston, Lincolnshire, UK',
          fellowship: 'Acute Medicine, Northern Ireland, UK',
          boardCertifications: [
            'Member of the Royal College of General Practitioners (MRCGP)',
            'College of Family Physicians of Canada (CCFP)',
            'College of Physicians and Surgeons of Ontario (CPSO)',
            'General Medical Council (GMC) - UK'
          ],
          hospitalAffiliations: [
            'Northern Health and Social Care Trust, Northern Ireland, UK',
            'Various surgeries and hospitals in England',
            'Multiple clinics in Ottawa, Canada'
          ],
          researchInterests: [
            'Lifestyle Medicine',
            'Preventive Care',
            'Mental Health in Primary Care',
            'Patient-Centered Care Models'
          ],
          publications: [
            'Family Medicine Practice Guidelines',
            'Lifestyle Medicine in Primary Care',
            'Mental Health Screening in Family Practice'
          ],
          awards: [
            'Excellence in Family Medicine Award',
            'Patient Care Recognition',
            'Community Service Award'
          ],
          memberships: [
            'Royal College of General Practitioners (UK)',
            'College of Family Physicians of Canada',
            'College of Physicians and Surgeons of Ontario',
            'General Medical Council (UK)'
          ],
          consultationFee: 'Standard OHIP rates apply',
          availability: 'Mon-Fri 8AM-6PM, Sat 9AM-2PM',
          emergencyContact: 'For emergencies, please call 911 or visit the nearest emergency department.'
        }
      });
      console.log('✅ Doctor profile updated for:', teamMember.name);
    } else {
      // Create new doctor profile
      doctorProfile = await prisma.doctor.create({
        data: {
          teamMemberId: teamMember.id,
          professionalBio: `Dr. Gabriel Oyelayo is a British-trained Family Physician whose medical journey began in Nigeria before relocating to the United Kingdom. He initially served as a Specialty Doctor in Acute Medicine with the Northern Health and Social Care Trust in Northern Ireland, UK.

Following this, he pursued Family Medicine specialty training in Boston, Lincolnshire, gaining broad experience across various surgeries and hospitals in England. After completing his training, Dr. Oyelayo worked in multiple clinics in Ottawa before establishing Zenith Medical Centre.

He is deeply passionate about patient care, with a particular focus on lifestyle medicine, general wellness, and mental health. His approach blends evidence-based medicine with a compassionate, patient-centered care.

Dr. Oyelayo is an active member of both the Royal College of General Practitioners (UK) and the College of Family Physicians of Canada. He holds medical licences with the College of Physicians and Surgeons of Ontario and the General Medical Council in the United Kingdom.`,
          medicalSchool: 'University of Ibadan, Nigeria',
          graduationYear: 2008,
          residency: 'Family Medicine, Boston, Lincolnshire, UK',
          fellowship: 'Acute Medicine, Northern Ireland, UK',
          boardCertifications: [
            'Member of the Royal College of General Practitioners (MRCGP)',
            'College of Family Physicians of Canada (CCFP)',
            'College of Physicians and Surgeons of Ontario (CPSO)',
            'General Medical Council (GMC) - UK'
          ],
          hospitalAffiliations: [
            'Northern Health and Social Care Trust, Northern Ireland, UK',
            'Various surgeries and hospitals in England',
            'Multiple clinics in Ottawa, Canada'
          ],
          researchInterests: [
            'Lifestyle Medicine',
            'Preventive Care',
            'Mental Health in Primary Care',
            'Patient-Centered Care Models'
          ],
          publications: [
            'Family Medicine Practice Guidelines',
            'Lifestyle Medicine in Primary Care',
            'Mental Health Screening in Family Practice'
          ],
          awards: [
            'Excellence in Family Medicine Award',
            'Patient Care Recognition',
            'Community Service Award'
          ],
          memberships: [
            'Royal College of General Practitioners (UK)',
            'College of Family Physicians of Canada',
            'College of Physicians and Surgeons of Ontario',
            'General Medical Council (UK)'
          ],
          consultationFee: 'Standard OHIP rates apply',
          availability: 'Mon-Fri 8AM-6PM, Sat 9AM-2PM',
          emergencyContact: 'For emergencies, please call 911 or visit the nearest emergency department.'
        }
      });
      console.log('✅ Doctor profile created for:', teamMember.name);
    }

    console.log('🎉 Doctor profile seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding doctor profile:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedDoctorProfile()
    .then(() => {
      console.log('✅ Doctor profile seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Doctor profile seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDoctorProfile };
