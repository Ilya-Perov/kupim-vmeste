from .models import FamilyGroup

class GroupService:

    @staticmethod
    def create_group(name, owner):
        group = FamilyGroup.objects.create(
            name=name,
            owner=owner,
        )

        group.members.add(owner)

        return group